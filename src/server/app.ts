import http from 'http';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import sharedSession from 'express-socket.io-session';
import socketIo from 'socket.io';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import AppState from './app_state';
import * as api from '../common/api';

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

function sessionStore(): expressSession.Store | expressSession.MemoryStore {
  if (isDevelopment()) {
    console.log('Using MemoryStore for session storage!');
    return new expressSession.MemoryStore();
  }
  let pool;
  if (typeof process.env.DATABASE_URL === 'string') {
    pool = new pg.Pool({
      database: process.env.DATABASE_URL,
    });
  } else {
    pool = new pg.Pool({
      host: 'localhost',
      database: 'hatgame',
    });
  }
  const PgSession = connectPgSimple(expressSession);
  const store = new PgSession({
    pool,
    tableName: 'session',
  });
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
    let uuid: string;
    if (req.session.uuid === undefined) {
      uuid = uuidv4();
      req.session.uuid = uuid;
    } else {
      uuid = req.session.uuid;
    }
    const { params: { room } } = req;
    appState.ensureInstanceExists(room);
    res.send(api.newHello(uuid));
  }
});

app.get('/api/message/:room/:text', (req, res) => {
  if (req.session !== undefined) {
    if (req.session.uuid !== undefined) {
      const { params: { room, text } } = req;
      const instance = appState.getInstance(room);
      if (instance === null) {
        res.send(api.newResult(false));
        return;
      }
      instance.sendMessage(req.session.uuid, text);
      console.log(req.session.uuid, room, text);
      res.send(api.newResult(true));
    }
  }
});

app.get('/api/setnickname/:room/:nickname', (req, res) => {
  if (req.session !== undefined) {
    if (req.session.uuid !== undefined) {
      const { params: { room, nickname } } = req;
      const instance = appState.getInstance(room);
      if (instance === null) {
        res.send(api.newResult(false));
        return;
      }
      if (!instance.setNickname(req.session.uuid, nickname)) {
        res.send(api.newResult(false));
        return;
      }
      console.log(req.session.uuid, room, nickname);
      res.send(api.newResult(true));
    }
  }
});
