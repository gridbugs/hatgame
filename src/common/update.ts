import * as t from 'io-ts';
import * as s from './state';

export const AddChatMessageT = t.type({
  tag: t.literal('AddChatMessage'),
  userUuid: s.UserUuid.t,
  messageText: s.MessageText.t,
});
export type AddChatMessage = t.TypeOf<typeof AddChatMessageT>;
export function mkAddChatMessage(
  userUuid: s.UserUuid,
  messageText: s.MessageText,
): AddChatMessage {
  return { tag: 'AddChatMessage', userUuid, messageText };
}

export const SetNicknameT = t.type({
  tag: t.literal('SetNickname'),
  userUuid: s.UserUuid.t,
  nickname: s.Nickname.t,
});
export type SetNickname = t.TypeOf<typeof SetNicknameT>;
export function mkSetNickname(
  userUuid: s.UserUuid,
  nickname: s.Nickname,
): SetNickname {
  return { tag: 'SetNickname', userUuid, nickname };
}

export const ReplaceStateT = t.type({
  tag: t.literal('ReplaceState'),
  state: s.StateT,
});
export type ReplaceState = t.TypeOf<typeof ReplaceStateT>;
export function mkReplaceState(
  state: s.State,
): ReplaceState {
  return { tag: 'ReplaceState', state };
}

export const AddUserT = t.type({
  tag: t.literal('AddUser'),
  user: s.UserT,
});
export type AddUser = t.TypeOf<typeof AddUserT>;
export function mkAddUser(
  user: s.User,
): AddUser {
  return { tag: 'AddUser', user };
}

export const RemoveUserT = t.type({
  tag: t.literal('RemoveUser'),
  userUuid: s.UserUuid.t,
});
export type RemoveUser = t.TypeOf<typeof RemoveUserT>;
export function mkRemoveUser(
  userUuid: s.UserUuid,
): RemoveUser {
  return { tag: 'RemoveUser', userUuid };
}

export const SetHostT = t.type({
  tag: t.literal('SetHost'),
  userUuid: s.UserUuid.t,
});
export type SetHost = t.TypeOf<typeof SetHostT>;
export function mkSetHost(
  userUuid: s.UserUuid,
): SetHost {
  return { tag: 'SetHost', userUuid };
}

export const UpdateT = t.union([
  AddChatMessageT,
  SetNicknameT,
  ReplaceStateT,
  AddUserT,
  RemoveUserT,
  SetHostT,
], 'Update');
export type Update = t.TypeOf<typeof UpdateT>;
