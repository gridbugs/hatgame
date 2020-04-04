import { v4 as uuidv4 } from 'uuid';
import {
  Option,
  none,
  some,
} from 'fp-ts/lib/Option';
import * as s from '../common/state-io';

export function sessionGetUserUuid(session?: Express.Session): Option<s.UserUuid> {
  if (session !== undefined && s.UserUuid.t.is(session.userUuid)) {
    return some(session.userUuid);
  }
  return none;
}

export function socketGetUserUuid(socket: SocketIO.Socket): Option<s.UserUuid> {
  return sessionGetUserUuid(socket.handshake.session);
}

export function sessionEnsureUserUuid(session: Express.Session): s.UserUuid {
  if (session.userUuid === undefined || !s.UserUuid.t.is(session.userUuid)) {
    // eslint-disable-next-line no-param-reassign
    session.userUuid = new s.UserUuid(uuidv4());
  }
  return session.userUuid;
}
