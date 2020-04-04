import { List } from 'immutable';
import socketIo from 'socket.io';
import { isSome } from 'fp-ts/lib/Option';
import GameInstance from '../common/game_instance';
import * as s from '../common/state-io';
import * as u from '../common/update';
import { MESSAGE_SERVER_TO_CLIENT } from '../common/socket_api';

function getSocketUserUuid(socket: socketIo.Socket): s.UserUuid | null {
  if (socket.handshake.session !== undefined && typeof socket.handshake.session.uuid === 'string') {
    return new s.UserUuid(socket.handshake.session.uuid);
  }
  return null;
}

export default class Instance {
  private game: GameInstance;

  private roomState: s.State;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.game = new GameInstance();
    this.roomState = s.EMPTY_STATE;
    this.socketNamespace.on('connection', (socket) => {
      const uuid = getSocketUserUuid(socket);
      if (uuid !== null) {
        console.log(`[${this.socketNamespace.name}] new connection from ${uuid}`);
        socket.emit(MESSAGE_SERVER_TO_CLIENT, u.mkReplaceState(this.roomState));
        console.log(JSON.stringify(this.roomState));
        this.addUserUuid(uuid);
        socket.on('disconnect', () => {
          console.log(`[${this.socketNamespace.name}] disconnect ${uuid}`);
          this.removeUserUuid(uuid);
        });
      }
    });
  }

  addUserUuid(userUuid: s.UserUuid): void {
    const user = s.mkUser(userUuid);
    const addUserUuid = u.mkAddUser(user);
    this.roomState = s.applyUpdate(this.roomState, addUserUuid);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, addUserUuid);
  }

  removeUserUuid(userUuid: s.UserUuid): void {
    const removeUserUuid = u.mkRemoveUser(userUuid);
    this.roomState = s.applyUpdate(this.roomState, removeUserUuid);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, removeUserUuid);
  }

  sendMessage(userUuid: s.UserUuid, messageText: s.MessageText): void {
    const addChatMessage = u.mkAddChatMessage(userUuid, messageText);
    this.roomState = s.applyUpdate(this.roomState, addChatMessage);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, addChatMessage);
  }

  setNickname(userUuid: s.UserUuid, nickname: s.Nickname): boolean {
    const allNicknames = List(this.roomState.users.values())
      .map((us) => us.nickname).filter(isSome).map((us) => us.value.toString());
    if (allNicknames.contains(nickname.toString())) {
      return false;
    }
    const setNickname = u.mkSetNickname(userUuid, nickname);
    this.roomState = s.applyUpdate(this.roomState, setNickname);
    this.socketNamespace.emit(MESSAGE_SERVER_TO_CLIENT, setNickname);
    return true;
  }
}
