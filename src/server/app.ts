import http from 'http';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import sharedSession from 'express-socket.io-session';
import socketIo from 'socket.io';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { isSome } from 'fp-ts/lib/Option';
import AppState from './app_state';
import { sessionGetUserUuid, sessionEnsureUserUuid } from './session';
import * as api from '../common/api';
import * as s from '../common/state-io';

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
  res.sendFile(path.resolve(__dirname, 'game.html'));
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.get('/api/hello/:room', (req, res) => {
  if (req.session !== undefined) {
    const userUuid = sessionEnsureUserUuid(req.session);
    const { params: { room } } = req;
    appState.ensureInstanceExists(room);
    res.send(api.HelloT.encode(api.mkHello(userUuid)));
  }
});

app.get('/api/message/:room/:text', (req, res) => {
  if (req.session !== undefined) {
    const maybeUserUuid = sessionGetUserUuid(req.session);
    if (isSome(maybeUserUuid)) {
      const userUuid = maybeUserUuid.value;
      const { params: { room, text } } = req;
      const instance = appState.getInstance(room);
      if (instance === null) {
        res.send(api.newResult(false));
        return;
      }
      instance.sendMessage(userUuid, new s.MessageText(text));
      console.log(userUuid.toString(), room, text);
      res.send(api.newResult(true));
    }
  }
});

app.get('/api/setnickname/:room/:nickname', (req, res) => {
  if (req.session !== undefined) {
    const maybeUserUuid = sessionGetUserUuid(req.session);
    if (isSome(maybeUserUuid)) {
      const userUuid = maybeUserUuid.value;
      const { params: { room, nickname } } = req;
      const instance = appState.getInstance(room);
      if (instance === null) {
        res.send(api.newResult(false));
        return;
      }
      if (!instance.setNickname(userUuid, new s.Nickname(nickname))) {
        res.send(api.newResult(false));
        return;
      }
      console.log(userUuid.toString(), room, nickname);
      res.send(api.newResult(true));
    }
  }
});
