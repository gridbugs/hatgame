import express from 'express';
import http from 'http';
import path from 'path';
import io  from 'socket.io';
import player from '../common/player';

function getPort(): number {
  const port = process.env.PORT;
  if (typeof port === 'string') {
    return parseInt(port);
  } else {
    return 8080;
  }
}

const app = express();
const server = http.createServer(app);
const port = getPort();

app.get("/", (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get("/bundle.js", (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve(__dirname, 'bundle.js'));
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
