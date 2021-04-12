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

export const CurrentUsersT = ti.set(UserUuidT);
export type CurrentUsers = t.TypeOf<typeof CurrentUsersT>;

export const WordT = t.string;
export type Word = t.TypeOf<typeof WordT>;

export const WordListT = ti.list(WordT);
export type WordList = t.TypeOf<typeof WordListT>;

export const WordBagT = ti.list(WordT);
export type WordBag = t.TypeOf<typeof WordBagT>;

export const NumSubmittedWordsByUserUuidT = ti.map(UserUuidT, t.number);
export type NumSubmittedWordsByUserUuid = t.TypeOf<typeof NumSubmittedWordsByUserUuidT>;

export const TeamT = ti.list(UserUuidT);
export type Team = t.TypeOf<typeof TeamT>;

export const TeamsT = ti.list(TeamT);
export type Teams = t.TypeOf<typeof TeamsT>;

export const TurnT = t.type({
  teamIndexWithinTeams: t.number,
  clueGiverIndexWithinTeam: t.number,
});
export type Turn = t.TypeOf<typeof TurnT>;
