import { List } from 'immutable';
import socketIo from 'socket.io';
import GameInstance from '../common/game_instance';
import * as state from '../common/state';
import { MESSAGE_SERVER_TO_CLIENT } from '../common/socket_api';

function getSocketUserUuid(socket: socketIo.Socket): state.UserUuid | null {
  if (socket.handshake.session !== undefined && typeof socket.handshake.session.uuid === 'string') {
    return socket.handshake.session.uuid;
  }
  return null;
}

export default class Instance {
  private game: GameInstance;

  private roomState: state.State;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.game = new GameInstance();
    this.roomState = state.EMPTY_STATE;
    this.socketNamespace.on('connection', (socket) => {
      const uuid = getSocketUserUuid(socket);
      if (uuid !== null) {
        console.log(`[${this.socketNamespace.name}] new connection from ${uuid}`);
        socket.emit(MESSAGE_SERVER_TO_CLIENT, state.mkReplaceState(this.roomState));
        console.log(JSON.stringify(this.roomState));
        this.addUserUuid(uuid);
        socket.on('disconnect', () => {
          console.log(`[${this.socketNamespace.name}] disconnect ${uuid}`);
          this.removeUserUuid(uuid);
        });
      }
    });
  }

  addUserUuid(userUuid: state.UserUuid): void {
    const addUserUuid = state.mkAddUserUuid(userUuid);
    this.roomState = state.updateState(this.roomState, addUserUuid);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, addUserUuid);
  }

  removeUserUuid(userUuid: state.UserUuid): void {
    const removeUserUuid = state.mkRemoveUserUuid(userUuid);
    this.roomState = state.updateState(this.roomState, removeUserUuid);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, removeUserUuid);
  }

  sendMessage(userUuid: state.UserUuid, messageText: state.MessageText): void {
    const addChatMessage = state.mkAddChatMessage(userUuid, messageText);
    this.roomState = state.updateState(this.roomState, addChatMessage);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, addChatMessage);
  }

  setNickname(userUuid: state.UserUuid, nickname: state.Nickname): boolean {
    const allNicknames = List(this.roomState.userNicknames.values());
    if (allNicknames.contains(nickname)) {
      return false;
    }
    const setNickname = state.mkSetNickname(userUuid, nickname);
    this.roomState = state.updateState(this.roomState, setNickname);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, setNickname);
    return true;
  }
}
