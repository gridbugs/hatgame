import * as t from 'io-ts';
import * as ti from 'io-ts-immutable';

export const UserUuidT = t.string;
export type UserUuid = t.TypeOf<typeof UserUuidT>;

export const MessageTextT = t.string;
export type MessageText = t.TypeOf<typeof MessageTextT>;

export const UserNameT = t.string;
export type UserName = t.TypeOf<typeof UserNameT>;

export const ChatMessageT = t.type({
  userUuid: UserUuidT,
  text: MessageTextT,
});
export type ChatMessage = t.TypeOf<typeof ChatMessageT>;

export const ChatT = ti.list(ChatMessageT);
export type Chat = t.TypeOf<typeof ChatT>;

export const UserT = t.type({
  name: UserNameT,
  uuid: UserUuidT,
});
export type User = t.TypeOf<typeof UserT>;

export const UserNamesByUuidT = ti.map(UserUuidT, UserNameT);
export type UserNamesByUuid = t.TypeOf<typeof UserNamesByUuidT>;
