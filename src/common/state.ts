import * as t from 'io-ts';
import { option } from 'io-ts-types/lib/option';
import {
  none,
  some,
  chain,
  getOrElse,
  Option,
} from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { left, right, Either } from 'fp-ts/lib/Either';
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

  static maybeMk(value: string): Either<Error, Nickname> {
    try {
      return right(new Nickname(value));
    } catch (_) {
      return left(new Error('illegal name'));
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

export const PlayingT = t.type({
  turn: t.Integer,
  turnOrder: tImmutable.list(UserUuid.t),
  teams: tImmutable.map(t.string, t.Integer, 'object'),
});
export type Playing = t.TypeOf<typeof PlayingT>;
export function mkPlaying(userUuids: i.List<UserUuid>): Playing {
  const turn = 0;
  // TODO: choose teams and arrange turn order to cycle through teams
  const turnOrder = userUuids;
  const teams = i.Map(
    userUuids.map((userUuid) => userUuid.toString()).zip(i.Repeat(0, userUuids.size))
  );
  return { turn, turnOrder, teams };
}

export const PhaseT = t.union([
  t.type({ tag: t.literal('Lobby') }),
  t.type({ tag: t.literal('Playing'), state: PlayingT }),
]);
export type Phase = t.TypeOf<typeof PhaseT>;
export function phaseLobby(): Phase {
  return { tag: 'Lobby' };
}
export function phasePlaying(playing: Playing): Phase {
  return { tag: 'Playing', state: playing };
}

export const StateT = t.type({
  host: UserUuid.t,
  phase: PhaseT,
  users: tImmutable.map(t.string, UserT, 'object'),
  chatMessages: tImmutable.list(ChatMessageT),
});
export type State = t.TypeOf<typeof StateT>;
export function mkState(host: UserUuid): State {
  return {
    host,
    phase: phaseLobby(),
    users: i.Map(),
    chatMessages: i.List(),
  };
}

export function getUser(state: State, userUuid: UserUuid): User {
  return pipe(
    fp.mapGetOpt(state.users, userUuid.toString()),
    getOrElse(() => mkUser(userUuid)),
  );
}

export function getHostUser(state: State): User {
  return getUser(state, state.host);
}

export function getNicknameOfUser(state: State, userUuid: UserUuid): Option<Nickname> {
  return pipe(
    fp.mapGetOpt(state.users, userUuid.toString()),
    chain((user) => user.nickname),
  );
}

export function allUsers(state: State): i.List<User> {
  return i.List(state.users.values());
}

export function allUserUuids(state: State): i.List<UserUuid> {
  return allUsers(state).map((user) => user.userUuid);
}

export function stateWithJustHost(state: State): State {
  const users = state.users.filter(({ userUuid }) => userUuid.eq(state.host));
  return {
    ...mkState(state.host),
    users,
  };
}

export function getCurrentTurnUserUuid(playing: Playing): UserUuid {
  return fp.indexedGetWrapping(playing.turnOrder, playing.turn);
}

// TODO: There should be a way to describe the type of State whose phase is Playing
export function getCurrentTurnUser(state: State, playing: Playing): User {
  return getUser(state, getCurrentTurnUserUuid(playing));
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

export function applySetHost(state: State, { userUuid }: u.SetHost): State {
  return {
    ...state,
    host: userUuid,
  };
}

export function applyStartGame(state: State, { tag: _ }: u.StartGame): State {
  return {
    ...state,
    phase: phasePlaying(mkPlaying(allUserUuids(state))),
  };
}

export function applyUpdate(state: State, update: u.Update): State {
  switch (update.tag) {
    case 'AddChatMessage': return applyAddChatMessage(state, update);
    case 'SetNickname': return applySetNickname(state, update);
    case 'ReplaceState': return applyReplaceState(state, update);
    case 'AddUser': return applyAddUser(state, update);
    case 'RemoveUser': return applyRemoveUser(state, update);
    case 'SetHost': return applySetHost(state, update);
    case 'StartGame': return applyStartGame(state, update);
  }
}
