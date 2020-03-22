import socketIo from 'socket.io';
import GameInstance from '../common/game_instance';

export default class Instance {
  private game: GameInstance;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.game = new GameInstance();
    this.socketNamespace.on('connection', (socket) => {
      if (socket.handshake.session !== undefined) {
        console.log(`[${this.socketNamespace.name}] new connection from ${socket.handshake.session.uuid}`);
        socket.on('message', (message) => {
          if (socket.handshake.session !== undefined) {
            console.log(`[${this.socketNamespace.name}] message from ${socket.handshake.session.uuid}: ${message}`);
            this.socketNamespace.emit('message', message);
          }
        });
      }
    });
  }
}
