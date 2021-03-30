import * as t from 'io-ts';
import * as s from './state';

export const LobbyT = t.type({
  usersByUuid: s.UsersByUuidT,
  chat: s.ChatT,
});
export type Lobby = t.TypeOf<typeof LobbyT>;
