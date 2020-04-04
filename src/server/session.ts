import { v4 as uuidv4 } from 'uuid';
import {
  Option,
  none,
  fromEither,
} from 'fp-ts/lib/Option';
import {
  isRight,
} from 'fp-ts/lib/Either';
import * as s from '../common/state-io';

export function sessionGetUserUuid(session?: Express.Session): Option<s.UserUuid> {
  if (session === undefined) {
    return none;
  }
  return fromEither(s.UserUuid.t.decode(session.userUuid));
}

export function socketGetUserUuid(socket: SocketIO.Socket): Option<s.UserUuid> {
  return sessionGetUserUuid(socket.handshake.session);
}

export function sessionEnsureUserUuid(session: Express.Session): s.UserUuid {
  const userUuidResult = s.UserUuid.t.decode(session.userUuid);
  if (isRight(userUuidResult)) {
    return userUuidResult.right;
  }
  const userUuid = new s.UserUuid(uuidv4());
  // eslint-disable-next-line no-param-reassign
  session.userUuid = s.UserUuid.t.encode(userUuid);
  return userUuid;
}
