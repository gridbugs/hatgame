import http from 'http';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import sharedSession from 'express-socket.io-session';
import socketIo from 'socket.io';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import * as t from 'io-ts';
import { isSome } from 'fp-ts/lib/Option';
import {
  fromOption,
  chain,
  map,
} from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import AppState from './app_state';
import Instance from './instance';
import { sessionGetUserUuid, sessionEnsureUserUuid } from './session';
import * as api from '../common/api';
import * as s from '../common/state';
import {
  OrError,
  orError,
  UnitOrErrorT,
  RIGHT_UNIT,
  UNIT,
} from '../common/fp';

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
  const PgSession = connectPgSimple(expressSession);
  const tableName = 'session';
  let store;
  if (typeof process.env.DATABASE_URL === 'string') {
    const conString = process.env.DATABASE_URL;
    console.log('conString', conString);
    store = new PgSession({ conString, tableName });
  } else {
    console.log('connecting to local postgres');
    const pool = new pg.Pool({
      host: 'localhost',
      database: 'hatgame',
    });
    store = new PgSession({ pool, tableName });
  }
  store.pruneSessions((err) => {
    if (err !== undefined) {
      throw new Error(JSON.stringify(err));
    }
  });
  return store;
}

const app = express();
const server = http.createServer(app);
const port = getPort();
const io = socketIo(server);
const session = expressSession({
  store: sessionStore(),
  secret: 'lid mouse license wallet',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
});
const socketSession = sharedSession(session, { autoSave: true });

const appState = new AppState(io, socketSession);

app.use(session);

io.use(sharedSession(session, { autoSave: true }));

app.use('/static', express.static(__dirname));

app.get('/favicon.ico', (_req, _res) => {
  // ignore request for favicon
});

app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/room/:room', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'chat.html'));
});

app.get('/create', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'create.html'));
});

app.get('/game/:room', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'game.html'));
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

function apiRegister<A, O, I>(
  codec: t.Type<A, O, I>,
  url: string,
  handler: (userUuiud: s.UserUuid, params: { [key: string]: string }) => A,
): void {
  app.get(url, (req, res) => {
    if (req.session !== undefined) {
      const maybeUserUuid = sessionGetUserUuid(req.session);
      if (isSome(maybeUserUuid)) {
        const response = handler(maybeUserUuid.value, req.params);
        const responseEncoded = codec.encode(response);
        res.send(JSON.stringify(responseEncoded));
      }
    }
  });
}

function instanceFromRoom(room: string): OrError<Instance> {
  return fromOption(() => new Error('no such room'))(appState.getInstance(room));
}

app.get('/api/hello', (req, res) => {
  if (req.session !== undefined) {
    const userUuid = sessionEnsureUserUuid(req.session);
    res.send(api.HelloT.encode(api.mkHello(userUuid)));
  }
});

apiRegister(t.string, '/api/create', (userUuid, _params) => {
  const instance = appState.makeInstanceRandomName(userUuid);
  return instance.name();
});

apiRegister(UnitOrErrorT, '/api/setnickname/:room/:nickname', (userUuid, params) => pipe(
  instanceFromRoom(params.room),
  chain((instance) => pipe(
    s.Nickname.maybeMk(params.nickname),
    chain((nickname) => instance.setNickname(userUuid, nickname)),
  )),
));

apiRegister(UnitOrErrorT, '/api/message/:room/:text', (userUuid, params) => pipe(
  instanceFromRoom(params.room),
  map((instance) => {
    instance.sendMessage(userUuid, new s.MessageText(params.text));
    return UNIT;
  }),
));

apiRegister(orError(s.StateT), '/api/basestate/:room', (_userUuid, params) => pipe(
  instanceFromRoom(params.room),
  map((instance) => instance.baseState())
));

apiRegister(UnitOrErrorT, '/api/startgame/:room/', (userUuid, params) => pipe(
  instanceFromRoom(params.room),
  chain((instance) => instance.startGame(userUuid)),
));
