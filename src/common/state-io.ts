import * as t from 'io-ts';
import { option } from 'io-ts-types/lib/option';
import * as tImmutable from 'io-ts-immutable';
import { StringId, mkStringIdType } from './string_id';

export class Nickname extends StringId {
  static t = mkStringIdType(Nickname);
}

export class MessageText extends StringId {
  static t = mkStringIdType(MessageText);
}

export class UserUuid extends StringId {
  static t = mkStringIdType(UserUuid);
}

export const ChatMessageT = t.type({
  userUuid: UserUuid.t,
  messageText: MessageText.t,
});
export type ChatMessage = t.TypeOf<typeof ChatMessageT>;

export const UserT = t.type({
  nickname: option(Nickname.t),
});
export type User = t.TypeOf<typeof UserT>;


export const StateT = t.type({
  users: tImmutable.map(t.string, UserT, 'object'),
  chatMessages: tImmutable.list(ChatMessageT),
});
export type State = t.TypeOf<typeof StateT>;
