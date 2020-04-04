import * as t from 'io-ts';
import * as s from '../common/state';

export const HelloT = t.type({
  userUuid: s.UserUuid.t,
});
export type Hello = t.TypeOf<typeof HelloT>;
export function mkHello(userUuid: s.UserUuid): Hello {
  return { userUuid };
}
