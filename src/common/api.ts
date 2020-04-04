import * as t from 'io-ts';
import * as s from '../common/state-io';

export interface Result {
  success: boolean;
}
export function isResult(obj: any): obj is Result {
  return typeof obj.success === 'boolean';
}
export function newResult(success: boolean): Result {
  return { success };
}

export const HelloT = t.type({
  userUuid: s.UserUuid.t,
});
export type Hello = t.TypeOf<typeof HelloT>;
export function mkHello(userUuid: s.UserUuid): Hello {
  return { userUuid };
}
