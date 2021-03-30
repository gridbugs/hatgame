import http from 'http';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import sharedSession from 'express-socket.io-session';
import socketIo from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { option, either } from 'fp-ts';
import { either as mkEitherT } from 'io-ts-types/lib/either';
import * as t from 'io-ts';
import * as m from '../common/message';
import * as mo from '../common/model';
import * as e from '../common/error';
import { AppState } from './app_state';

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

function socketIOSessionUuid(socket: any): option.Option<string> {
  if (socket.handshake !== undefined) {
    if (socket.handshake.session !== undefined) {
      return option.some(getUuidGeneratingIfNotDefined(socket.handshake.session));
    }
  }
  return option.none;
}

const app = express();
const server = http.createServer(app);
const port = getPort();
const io = new socketIo.Server(server);
const session = expressSession({
  store: sessionStore(),
  secret: 'lid mouse license wallet',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
});
const socketSession = sharedSession(session, { autoSave: true });

app.use(session);

io.use(sharedSession(session, { autoSave: true }));

app.use('/static', express.static(__dirname));

let appState = AppState.empty;
const socketNamespacesByRoomName: Map<string, socketIo.Namespace> = new Map();

app.get('/game/:game', (req, res) => {
  const room = req.params.game;
  if (room !== undefined) {
    if (!socketNamespacesByRoomName.has(room)) {
      const socketNamespace = io.of(room).use(socketSession);
      socketNamespace.on('connection', (socket) => {
        console.log(socket.id);
        const userUuidOption = socketIOSessionUuid(socket);
        if (option.isSome(userUuidOption)) {
          const userUuid = userUuidOption.value;
          console.log(`socket connect: ${userUuid}`);
          const state = appState.getRoomState(room);
          const model = mo.LobbyT.encode(state.toModelLoby());
          socketNamespace.emit('update', model);
        }
      });
      socketNamespacesByRoomName.set(room, socketNamespace);
    }
  }
  res.sendFile(path.resolve(__dirname, 'game.html'));
});

app.get('/query/current-user-uuid', (req, res) => {
  const userUuid = getUuidGeneratingIfNotDefined(req.session);
  res.send(userUuid);
});

app.get('/query/current-user-uuid', (req, res) => {
  const userUuid = getUuidGeneratingIfNotDefined(req.session);
  res.send(userUuid);
});

app.get('/message/:message', (req, res) => {
  console.log(req.params.message);
  let messageObject;
  try {
    messageObject = JSON.parse(req.params.message);
  } catch {
    res.send(mkEitherT(e.ErrorT, t.string).encode(either.left({ tag: 'JsonParsingFailed' })));
    return;
  }
  const messageEither = m.MessageForRoomT.decode(messageObject);
  let requestResult: either.Either<e.Error, 'ok'> = either.right('ok');
  if (either.isRight(messageEither)) {
    const userUuid = getUuidGeneratingIfNotDefined(req.session);
    const { room, message } = messageEither.right;
    appState = appState.updateRoomState(room, (roomState) => {
      console.log(message);
      switch (message.tag) {
        case 'EnsureUserInRoomWithName': {
          const result = roomState.ensureUserInRoomWithName(userUuid, message.content.name);
          if (either.isLeft(result)) {
            requestResult = either.left({ tag: result.left });
            return roomState;
          }
          return result.right;
        }
        case 'AddChatMessage': {
          const result = roomState.addChatMessage({ userUuid, text: message.content.text });
          if (either.isLeft(result)) {
            requestResult = either.left({ tag: result.left });
            return roomState;
          }
          return result.right;
        }
        case 'AddWord': {
          const result = roomState.addWord(userUuid, message.content.word);
          if (either.isLeft(result)) {
            requestResult = either.left({ tag: result.left });
            return roomState;
          }
          return result.right;
        }
      }
    });
  } else {
    requestResult = either.left({ tag: 'DecodingFailed' });
  }
  if (either.isRight(requestResult)) {
    if (either.isRight(messageEither)) {
      const { room } = messageEither.right;
      const socketNamespace = socketNamespacesByRoomName.get(room);
      if (socketNamespace !== undefined) {
        const state = appState.getRoomState(room);
        const model = mo.LobbyT.encode(state.toModelLoby());
        socketNamespace.emit('update', model);
      }
    }
  }
  console.log(requestResult);
  console.log(JSON.stringify(appState, null, ' '));
  res.send(mkEitherT(e.ErrorT, t.literal('ok')).encode(requestResult));
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
