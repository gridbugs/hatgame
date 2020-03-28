import { List } from 'immutable';
import socketIo from 'socket.io';
import GameInstance from '../common/game_instance';
import {
  State as RoomState,
  EMPTY_STATE,
  newAddChatMessage,
  UserUuid,
  MessageText,
  updateState,
  newReplaceState,
  newSetNickname,
  Nickname,
} from '../common/state';

export default class Instance {
  private game: GameInstance;

  private roomState: RoomState;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.game = new GameInstance();
    this.roomState = EMPTY_STATE;
    this.socketNamespace.on('connection', (socket) => {
      if (socket.handshake.session !== undefined && typeof socket.handshake.session.uuid === 'string' ) {
        console.log(
          `[${this.socketNamespace.name}] new connection from ${socket.handshake.session.uuid}`
        );
        socket.emit('messageServerToClient', newReplaceState(this.roomState));
      }
    });
  }

  sendMessage(userUuid: UserUuid, messageText: MessageText): void {
    const addChatMessage = newAddChatMessage(userUuid, messageText);
    this.roomState = updateState(this.roomState, addChatMessage);
    this.socketNamespace.emit('messageServerToClient', addChatMessage);
  }

  setNickname(userUuid: UserUuid, nickname: Nickname): boolean {
    const allNicknames = List(this.roomState.userNicknames.values());
    if (allNicknames.contains(nickname)) {
      return false;
    }
    const setNickname = newSetNickname(userUuid, nickname);
    this.roomState = updateState(this.roomState, setNickname);
    this.socketNamespace.emit('messageServerToClient', setNickname);
    return true;
  }
}
