import { List } from 'immutable';
import socketIo from 'socket.io';
import { Either, left, right } from 'fp-ts/lib/Either';
import { isSome } from 'fp-ts/lib/Option';
import * as s from '../common/state';
import * as u from '../common/update';
import * as socketApi from '../common/socket_api';
import { socketGetUserUuid } from './session';
import { Unit, UNIT } from '../common/fp';

export default class Instance {
  private roomState: s.State;

  constructor(private socketNamespace: socketIo.Namespace) {
    this.roomState = s.EMPTY_STATE;
    this.socketNamespace.on('connection', (socket) => {
      const maybeUserUuid = socketGetUserUuid(socket);
      if (isSome(maybeUserUuid)) {
        const userUuid = maybeUserUuid.value;
        console.log(`[${this.socketNamespace.name}] new connection from ${userUuid}`);
        socket.emit(socketApi.toString('MessageServerToClient'), u.UpdateT.encode(u.mkReplaceState(this.roomState)));
        this.addUserUuid(userUuid);
        socket.on('disconnect', () => {
          console.log(`[${this.socketNamespace.name}] disconnect ${userUuid}`);
          this.removeUserUuid(userUuid);
        });
      }
    });
  }

  applyUpdate(update: u.Update): void {
    this.roomState = s.applyUpdate(this.roomState, update);
    const encoded = u.UpdateT.encode(update);
    this.socketNamespace.emit(socketApi.toString('MessageServerToClient'), encoded);
  }

  addUserUuid(userUuid: s.UserUuid): void {
    const user = s.mkUser(userUuid);
    this.applyUpdate(u.mkAddUser(user));
  }

  removeUserUuid(userUuid: s.UserUuid): void {
    this.applyUpdate(u.mkRemoveUser(userUuid));
  }

  sendMessage(userUuid: s.UserUuid, messageText: s.MessageText): void {
    this.applyUpdate(u.mkAddChatMessage(userUuid, messageText));
  }

  setNickname(userUuid: s.UserUuid, nickname: s.Nickname): Either<string, Unit> {
    const allNicknames = List(this.roomState.users.values())
      .map((us) => us.nickname).filter(isSome).map((us) => us.value.toString());
    if (allNicknames.contains(nickname.toString())) {
      return left('nickname already taken');
    }
    this.applyUpdate(u.mkSetNickname(userUuid, nickname));
    return right(UNIT);
  }
}
