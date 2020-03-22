import http from 'http';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import sharedSession from 'express-socket.io-session';
import socketIo from 'socket.io';
import { v4 as uuid } from 'uuid';
import AppState from './app_state';

function getPort(): number {
  const port = process.env.PORT;
  if (typeof port === 'string') {
    return parseInt(port, 10);
  }
  return 8080;
}

const app = express();
const server = http.createServer(app);
const port = getPort();
const io = socketIo(server);
const _state = new AppState();
const session = expressSession({
  secret: 'lid mouse license wallet',
  resave: false,
  saveUninitialized: true,
});

app.use(session);

io.use(sharedSession(session, { autoSave: true }));

app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('**/bundle.js', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'bundle.js'));
});

app.get('/*', (req, res) => {
  if (req.session !== undefined) {
    if (req.session.uuid === undefined) {
      req.session.uuid = uuid();
    }
    console.log(req.session.uuid);
  }
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  if (socket.handshake.session !== undefined) {
    console.log('a user connected', socket.handshake.session.uuid);
  }
  socket.on('foo', (msg: any) => {
    console.log('got an event', msg);
    socket.broadcast.emit('bar', { beep: 'boop' });
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
