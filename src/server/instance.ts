import { List } from 'immutable';
import socketIo from 'socket.io';
import { isSome } from 'fp-ts/lib/Option';
import * as s from '../common/state-io';
import * as u from '../common/update';
import * as socketApi from '../common/socket_api';
import { socketGetUserUuid } from './session';

export default class Instance {
  private roomState: s.State;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.roomState = s.EMPTY_STATE;
    this.socketNamespace.on('connection', (socket) => {
      const maybeUserUuid = socketGetUserUuid(socket);
      if (isSome(maybeUserUuid)) {
        const userUuid = maybeUserUuid.value;
        console.log(`[${this.socketNamespace.name}] new connection from ${userUuid}`);
        socket.emit(socketApi.toString('MessageServerToClient'), u.mkReplaceState(this.roomState));
        console.log(JSON.stringify(this.roomState));
        this.addUserUuid(userUuid);
        socket.on('disconnect', () => {
          console.log(`[${this.socketNamespace.name}] disconnect ${userUuid}`);
          this.removeUserUuid(userUuid);
        });
      }
    });
  }

  addUserUuid(userUuid: s.UserUuid): void {
    const user = s.mkUser(userUuid);
    const addUserUuid = u.mkAddUser(user);
    this.roomState = s.applyUpdate(this.roomState, addUserUuid);
    this.socketNamespace.emit(socketApi.toString('MessageServerToClient'), addUserUuid);
  }

  removeUserUuid(userUuid: s.UserUuid): void {
    const removeUserUuid = u.mkRemoveUser(userUuid);
    this.roomState = s.applyUpdate(this.roomState, removeUserUuid);
    this.socketNamespace.emit(socketApi.toString('MessageServerToClient'), removeUserUuid);
  }

  sendMessage(userUuid: s.UserUuid, messageText: s.MessageText): void {
    const addChatMessage = u.mkAddChatMessage(userUuid, messageText);
    this.roomState = s.applyUpdate(this.roomState, addChatMessage);
    this.socketNamespace.emit(socketApi.toString('MessageServerToClient'), addChatMessage);
  }

  setNickname(userUuid: s.UserUuid, nickname: s.Nickname): boolean {
    const allNicknames = List(this.roomState.users.values())
      .map((us) => us.nickname).filter(isSome).map((us) => us.value.toString());
    if (allNicknames.contains(nickname.toString())) {
      return false;
    }
    const setNickname = u.mkSetNickname(userUuid, nickname);
    this.roomState = s.applyUpdate(this.roomState, setNickname);
    this.socketNamespace.emit(socketApi.toString('MessageServerToClient'), setNickname);
    return true;
  }
}
