import http from 'http';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import sharedSession from 'express-socket.io-session';
import socketIo from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { option, either } from 'fp-ts';
import * as m from '../common/message';
import * as s from './app_state';

console.log(s);

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
const _socketSession = sharedSession(session, { autoSave: true });

app.use(session);

io.use(sharedSession(session, { autoSave: true }));

app.use('/static', express.static(__dirname));

app.get('/game/:game', (req, res) => {
  const _sessionUuid = getUuidGeneratingIfNotDefined(req.session);
  res.sendFile(path.resolve(__dirname, 'game.html'));
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

function handleAddChatMessage(uuid: string, message: m.AddChatMessage): void {
  console.log(uuid, message);
}

function handleAddWord(uuid: string, message: m.AddWord): void {
  console.log(uuid, message);
}

io.on('connection', (socket) => {
  const sessionUuidOption = socketIOSessionUuid(socket);
  if (option.isSome(sessionUuidOption)) {
    const sessionUuid = sessionUuidOption.value;
    socket.on('message', (messageEncoded) => {
      const messageEither = m.MessageT.decode(messageEncoded);
      if (either.isRight(messageEither)) {
        const message = messageEither.right;
        switch (message.tag) {
          case 'AddChatMessage':
            handleAddChatMessage(sessionUuid, message);
            break;
          case 'AddWord':
            handleAddWord(sessionUuid, message);
            break;
        }
      }
    });
  }
});
