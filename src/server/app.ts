import http from 'http';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import sharedSession from 'express-socket.io-session';
import socketIo from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { either } from 'fp-ts';
import * as u from '../common/update';
import * as m from '../common/model';
import { AppState } from './app_state';
import { RoomState, UserUuid } from './room_state';
import * as w from '../common/websocket_api';
import { ModelUpdate } from '../common/model_update';
import * as debug from './debug';

function getPort(): number {
  const port = process.env.PORT;
  if (typeof port === 'string') {
    return parseInt(port, 10);
  }
  return 8080;
}

function isDevelopment(): boolean {
  const dev = process.env.DEV;
  if (dev !== undefined) {
    return true;
  }
  return false;
}

async function debugDelay(): Promise<void> {
  const delayMillisString = process.env.DELAY_MILLIS;
  if (typeof delayMillisString === 'string') {
    const delayMillis = parseInt(delayMillisString, 10);
    await debug.delay(delayMillis);
  }
}

function memorySessionStore(): expressSession.MemoryStore {
  console.log('Using MemoryStore for session storage!');
  return new expressSession.MemoryStore();
}

function sessionStore(): expressSession.Store | expressSession.MemoryStore {
  if (isDevelopment()) {
    return memorySessionStore();
  }
  throw new Error('TODO: set up persistent session store');
}

function getUuidGeneratingIfNotDefined(session: any): string {
  const currentUuid = session.uuid;
  if (typeof currentUuid === 'string') {
    return currentUuid;
  }
  // eslint-disable-next-line no-param-reassign
  session.uuid = uuidv4();
  session.save();
  return session.uuid;
}

function socketIOSessionUuid(socket: any): string {
  if (socket.handshake !== undefined) {
    if (socket.handshake.session !== undefined) {
      const uuid = getUuidGeneratingIfNotDefined(socket.handshake.session);
      return uuid;
    }
  }
  throw new Error('socket has no session information');
}

let appState = AppState.empty;
const app = express();
const server = http.createServer(app);
const port = getPort();
const io = new socketIo.Server(server);
const session = expressSession({
  store: sessionStore(),
  secret: 'lid mouse license wallet',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
});
const socketSession = sharedSession(session, { autoSave: true });

function updateRoomState({
  room, userUuid, f,
}: {
  room: string,
  userUuid: UserUuid,
  f: (s: RoomState) => either.Either<u.UpdateFailedReason, RoomState>
}): u.UpdateResult {
  const roomUpdateResult = appState.tryUpdateRoomState(room, f);
  if (either.isRight(roomUpdateResult)) {
    const { appState: newAppState, roomState } = roomUpdateResult.right;
    appState = newAppState;
    const model = m.ModelT.encode(roomState.toModel(userUuid));
    console.log(ModelUpdate, JSON.stringify(model));
    io.use(socketSession).to(`/room/${room}`).emit(ModelUpdate, model);
    return u.UpdateResultOk;
  }
  return either.left({ tag: 'UpdateFailed', reason: roomUpdateResult.left });
}

function applyUpdate({
  room, userUuid, update,
}: { room: string, userUuid: m.UserUuid, update: u.Update }): u.UpdateResult {
  return updateRoomState({
    room,
    userUuid,
    f: (roomState) => {
      switch (update.tag) {
        case 'EnsureUserInRoomWithName': {
          return roomState.ensureUserInRoomWithName({
            userUuid,
            name: update.content.name,
            makeCurrent: update.content.makeCurrent,
          });
        }
        case 'AddChatMessage': {
          return roomState.addChatMessage({ userUuid, text: update.content.text });
        }
        case 'SetWords': {
          return roomState.setWords(userUuid, update.content.words);
        }
      }
    }
  });
}

function tryApplyEncodedUpdate({
  room, userUuid, updateEncoded,
}: { room: string, userUuid: m.UserUuid, updateEncoded: any }): u.UpdateResult {
  const updateEither = u.UpdateT.decode(updateEncoded);
  if (either.isRight(updateEither)) {
    return applyUpdate({ room, userUuid, update: updateEither.right });
  }
  return either.left({ tag: 'DecodingFailed' });
}

io.use(socketSession).on('connection', (socket: socketIo.Socket) => {
  if (typeof socket.handshake.query.room === 'string') {
    const { room } = socket.handshake.query;
    const userUuid = socketIOSessionUuid(socket);
    console.log(`new socket connection by [${userUuid} to ${room}`);
    socket.join(`/user/${userUuid}`);
    socket.join(`/room/${room}`);
    socket.on(w.GetCurrentUserUuid, async (callback) => {
      await debugDelay();
      callback(m.UserUuidT.encode(userUuid));
    });
    socket.on(w.GetModel, async (callback) => {
      await debugDelay();
      const state = appState.getRoomState(room);
      callback(m.ModelT.encode(state.toModel(userUuid)));
    });
    socket.on(w.Update, async (updateEncoded: any, callback) => {
      await debugDelay();
      const result = tryApplyEncodedUpdate({ room, userUuid, updateEncoded });
      callback(result);
    });
    socket.on('disconnect', (_reason) => updateRoomState({
      room,
      userUuid,
      f: (roomState) => roomState.makeUserNotCurrent(userUuid)
    }));
    updateRoomState({
      room,
      userUuid,
      f: (roomState) => roomState.makeUserCurrent(userUuid)
    });
  }
});

app.use(session);

app.use('/static', express.static(__dirname));

app.get('/game/:room', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'game.html'));
});
app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});
app.get('/favicon.ico', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'favicon.ico'));
});

app.get('/update/:room/:update', async (req, res) => {
  let updateEncoded;
  let room;
  try {
    updateEncoded = JSON.parse(req.params.update);
    room = req.params.room;
  } catch {
    res.send(u.HttpUpdateResultT.encode(either.left('JsonParsingFailed')));
    return;
  }
  const userUuid = getUuidGeneratingIfNotDefined(req.session);
  await debugDelay();
  const result = tryApplyEncodedUpdate({ room, userUuid, updateEncoded });
  res.send(result);
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
