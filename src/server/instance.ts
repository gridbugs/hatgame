import socketIo from 'socket.io';
import GameInstance from '../common/game_instance';

export default class Instance {
  private game: GameInstance;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.game = new GameInstance();
    this.socketNamespace.on('connection', (socket) => {
      if (socket.handshake.session !== undefined) {
        console.log(`[${this.socketNamespace.name}] new connection from ${socket.handshake.session.uuid}`);
        socket.on('message', (text) => {
          if (socket.handshake.session !== undefined) {
            const { handshake: { session: { uuid } } } = socket;
            console.log(uuid);
            if (typeof uuid === 'string' && typeof text === 'string') {
              const message = {
                userUuid: uuid,
                text,
              };
              console.log(`[${this.socketNamespace.name}] message from ${uuid}: ${text}`);
              this.socketNamespace.emit('message', message);
            }
          }
        });
      }
    });
  }
}
