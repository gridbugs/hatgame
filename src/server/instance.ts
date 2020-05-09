import { List } from 'immutable';
import socketIo from 'socket.io';
import { left } from 'fp-ts/lib/Either';
import { isSome } from 'fp-ts/lib/Option';
import * as s from '../common/state';
import * as u from '../common/update';
import * as socketApi from '../common/socket_api';
import { socketGetUserUuid } from './session';
import { UnitOrError, RIGHT_UNIT } from '../common/fp';

export default class Instance {
  private roomState: s.State;

  constructor(private socketNamespace: socketIo.Namespace, host: s.UserUuid) {
    this.roomState = s.mkState(host);
    this.socketNamespace.on('connection', (socket) => {
      const maybeUserUuid = socketGetUserUuid(socket);
      if (isSome(maybeUserUuid)) {
        const userUuid = maybeUserUuid.value;
        console.log(`[${this.socketNamespace.name}] new connection from ${userUuid}`);
        socket.emit(socketApi.toString('MessageServerToClient'), u.UpdateT.encode(u.mkReplaceState(this.roomState)));
        if (!this.roomState.users.has(userUuid.toString())) {
          this.addUserUuid(userUuid);
        }
        socket.on('disconnect', () => {
          console.log(`[${this.socketNamespace.name}] disconnect ${userUuid}`);
        });
      }
    });
  }

  name(): string {
    return this.socketNamespace.name.replace(/^\//, '');
  }

  applyUpdate(update: u.Update): void {
    this.roomState = s.applyUpdate(this.roomState, update);
    const encoded = u.UpdateT.encode(update);
    this.socketNamespace.emit(socketApi.toString('MessageServerToClient'), encoded);
  }

  setHost(host: s.UserUuid): void {
    this.applyUpdate(u.mkSetHost(host));
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

  setNickname(userUuid: s.UserUuid, nickname: s.Nickname): UnitOrError {
    const allNicknames = List(this.roomState.users.values())
      .map((us) => us.nickname).filter(isSome).map((us) => us.value.toString());
    if (allNicknames.contains(nickname.toString())) {
      return left(new Error('nickname already taken'));
    }
    this.applyUpdate(u.mkSetNickname(userUuid, nickname));
    return RIGHT_UNIT;
  }

  baseState(): s.State {
    return s.stateWithJustHost(this.roomState);
  }

  startGame(userUuid: s.UserUuid): UnitOrError {
    if (!this.roomState.host.eq(userUuid)) {
      return left(new Error('only the host can start the game'));
    }
    this.applyUpdate(u.mkStartGame());
    return RIGHT_UNIT;
  }
}
