import socketIo from 'socket.io';
import GameInstance from '../common/game_instance';
import {
  State as RoomState,
  EMPTY_STATE,
  newAddChatMessage,
  isUserUuid,
  isMessageText,
  updateState,
  newReplaceState,
} from '../common/state';

export default class Instance {
  private game: GameInstance;

  private roomState: RoomState;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.game = new GameInstance();
    this.roomState = EMPTY_STATE;
    this.socketNamespace.on('connection', (socket) => {
      socket.emit('messageServerToClient', newReplaceState(this.roomState));
      if (socket.handshake.session !== undefined) {
        console.log(`[${this.socketNamespace.name}] new connection from ${socket.handshake.session.uuid}`);
        socket.on('messageClientToServer', (text) => {
          if (socket.handshake.session !== undefined) {
            const { handshake: { session: { uuid } } } = socket;
            if (isUserUuid(uuid) && isMessageText(text)) {
              const addChatMessage = newAddChatMessage(uuid, text);
              this.roomState = updateState(this.roomState, addChatMessage);
              console.log(`[${this.socketNamespace.name}] message from ${uuid}: ${text}`);
              this.socketNamespace.emit('messageServerToClient', addChatMessage);
            }
          }
        });
      }
    });
  }
}
