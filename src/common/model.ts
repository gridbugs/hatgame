import * as t from 'io-ts';
import { ChatT, UserNamesByUuidT, CurrentUsersT } from './types';

export * from '../common/types';

export const LobbyT = t.type({
  userNamesByUuid: UserNamesByUuidT,
  currentUsers: CurrentUsersT,
  chat: ChatT,
});
export type Lobby = t.TypeOf<typeof LobbyT>;

export const GameT = t.type({
  userNamesByUuid: UserNamesByUuidT,
  chat: ChatT,
});
export type Game = t.TypeOf<typeof GameT>;

export const ModelT = t.union([
  t.type({ tag: t.literal('Null') }),
  t.type({ tag: t.literal('Lobby'), content: LobbyT }),
  t.type({ tag: t.literal('Game'), content: GameT }),
]);
export type Model = t.TypeOf<typeof ModelT>;
export const ModelNull: Model = { tag: 'Null' };
