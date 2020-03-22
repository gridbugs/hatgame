import express from 'express';
import http from 'http';
import path from 'path';
import socketIo from 'socket.io';
import _player from '../common/player';

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

app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/bundle.js', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'bundle.js'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('foo', (msg: any) => {
    console.log('got an event', msg);
    socket.emit('bar', { beep: 'boop' });
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
