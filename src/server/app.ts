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
import * as w from '../common/websocket_api';
import { ModelUpdate } from '../common/model_update';

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
  return session.uuid;
}

function socketIOSessionUuid(socket: any): string {
  if (socket.handshake !== undefined) {
    if (socket.handshake.session !== undefined) {
      const uuid = getUuidGeneratingIfNotDefined(socket.handshake.session);
      socket.handshake.session.save();
      return uuid;
    }
  }
  throw new Error('socket has no session information');
}

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

let appState = AppState.empty;

const socketNamespacePattern = /^\/room\/(\w+)$/;
const workspaces = io.of(socketNamespacePattern).use(socketSession);

workspaces.on('connection', (socket) => {
  const socketName = socket.nsp.name;
  const matches = socketName.match(socketNamespacePattern);
  if (matches === null) {
    console.log(`unexpected socket namespace: ${socketName}`);
    return;
  }
  const userUuid = socketIOSessionUuid(socket);
  console.log(`new socket connection by [${userUuid} to: ${socketName}`);
  const room = matches[1];
  socket.join(userUuid);
  socket.on(w.GetCurrentUserUuid, (callback) => {
    callback(m.UserUuidT.encode(userUuid));
  });
  socket.on(w.GetModel, (callback) => {
    const state = appState.getRoomState(room);
    callback(m.ModelT.encode(state.toModel()));
  });
  socket.on(w.Update, (updateEncoded: any, callback) => {
    const updateEither = u.UpdateT.decode(updateEncoded);
    let requestResult = u.UpdateResultOk;
    if (either.isRight(updateEither)) {
      const update = updateEither.right;
      const roomUpdateResult = appState.tryUpdateRoomState(room, (roomState) => {
        switch (update.tag) {
          case 'EnsureUserInRoomWithName': {
            return roomState.ensureUserInRoomWithName(userUuid, update.content.name);
          }
          case 'AddChatMessage': {
            return roomState.addChatMessage({ userUuid, text: update.content.text });
          }
          case 'AddWord': {
            return roomState.addWord(userUuid, update.content.word);
          }
        }
      });
      if (either.isRight(roomUpdateResult)) {
        console.log(`applied update to [${room}] from [${userUuid}]: ${JSON.stringify(update)}`);
        const { appState: newAppState, roomState } = roomUpdateResult.right;
        appState = newAppState;
        const model = m.ModelT.encode(roomState.toModel());
        io.use(socketSession).of(`/room/${room}`).emit(ModelUpdate, model);
      } else {
        requestResult = either.left({ tag: 'UpdateFailed', reason: roomUpdateResult.left });
      }
    } else {
      requestResult = either.left({ tag: 'DecodingFailed' });
    }
    callback(requestResult);
  });
});

app.use(session);

app.use('/static', express.static(__dirname));

app.get('/game/:game', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'game.html'));
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
