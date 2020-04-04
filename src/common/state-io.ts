import * as t from 'io-ts';
import { option } from 'io-ts-types/lib/option';
import {
  none,
  some,
  chain,
  Option,
} from 'fp-ts/lib/Option';
import * as tImmutable from 'io-ts-immutable';
import * as i from 'immutable';
import { StringId, mkStringIdType } from './string_id';
import * as u from './update';
import * as fp from './fp';

export class Nickname extends StringId {
  constructor(value: string) {
    super(value);
    if (Nickname.illegal.has(value)) {
      throw new Error('illegal nickname');
    }
  }

  private static readonly illegal = new Set(['', 'anonymous']);

  static readonly t = mkStringIdType(Nickname);
}

export class MessageText extends StringId {
  static readonly t = mkStringIdType(MessageText);
}

export class UserUuid extends StringId {
  static readonly t = mkStringIdType(UserUuid);
}

export const ChatMessageT = t.type({
  userUuid: UserUuid.t,
  messageText: MessageText.t,
});
export type ChatMessage = t.TypeOf<typeof ChatMessageT>;
export function mkChatMessage(userUuid: UserUuid, messageText: MessageText): ChatMessage {
  return { userUuid, messageText };
}

export const UserT = t.type({
  userUuid: UserUuid.t,
  nickname: option(Nickname.t),
});
export type User = t.TypeOf<typeof UserT>;
export function mkUser(userUuid: UserUuid): User {
  return { userUuid, nickname: none };
}

export const StateT = t.type({
  users: tImmutable.map(t.string, UserT, 'object'),
  chatMessages: tImmutable.list(ChatMessageT),
});
export type State = t.TypeOf<typeof StateT>;
export const EMPTY_STATE: State = {
  users: i.Map(),
  chatMessages: i.List(),
};
export function stateGetNickname(state: State, userUuid: UserUuid): Option<Nickname> {
  return chain((us: User) => us.nickname)(fp.mapGetOpt(state.users, userUuid.toString()));
}
export function stateAllUsers(state: State): i.List<User> {
  return i.List(state.users.values());
}

export function applyAddChatMessage(
  state: State,
  { userUuid, messageText }: u.AddChatMessage,
): State {
  const { chatMessages } = state;
  return {
    ...state,
    chatMessages: chatMessages.push(mkChatMessage(userUuid, messageText)),
  };
}

export function applySetNickname(state: State, { userUuid, nickname }: u.SetNickname): State {
  const { users } = state;
  return {
    ...state,
    users: users.update(userUuid.toString(), { userUuid, nickname: none },
      (user: User) => ({ ...user, nickname: some(nickname) })),
  };
}

export function applyReplaceState(_state: State, { state: newState }: u.ReplaceState): State {
  return newState;
}

export function applyAddUser(state: State, { user }: u.AddUser): State {
  const { userUuid } = user;
  const { users } = state;
  return {
    ...state,
    users: users.set(userUuid.toString(), user),
  };
}

export function applyRemoveUser(state: State, { userUuid }: u.RemoveUser): State {
  const { users } = state;
  return {
    ...state,
    users: users.remove(userUuid.toString()),
  };
}

export function applyUpdate(state: State, update: u.Update): State {
  switch (update.tag) {
    case 'AddChatMessage': return applyAddChatMessage(state, update);
    case 'SetNickname': return applySetNickname(state, update);
    case 'ReplaceState': return applyReplaceState(state, update);
    case 'AddUser': return applyAddUser(state, update);
    case 'RemoveUser': return applyRemoveUser(state, update);
  }
}
