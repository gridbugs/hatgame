import * as t from 'io-ts';
import { either } from 'fp-ts';
import { either as mkEitherT } from 'io-ts-types/lib/either';

export const EnsureUserInRoomWithNameT = t.type({
  name: t.string,
});
export type EnsureUserInRoomWithName = t.TypeOf<typeof EnsureUserInRoomWithNameT>;

export const AddChatMessageT = t.type({
  text: t.string,
});
export type AddChatMessage = t.TypeOf<typeof AddChatMessageT>;

export const AddWordT = t.type({
  word: t.string,
});
export type AddWord = t.TypeOf<typeof AddWordT>;

export const UpdateT = t.union([
  t.type({
    tag: t.literal('EnsureUserInRoomWithName'),
    content: EnsureUserInRoomWithNameT,
  }),
  t.type({
    tag: t.literal('AddChatMessage'),
    content: AddChatMessageT,
  }),
  t.type({
    tag: t.literal('AddWord'),
    content: AddWordT,
  }),
]);
export type Update = t.TypeOf<typeof UpdateT>;

export function mkEnsureUserInRoomWithName({ name }: { name: string }): Update {
  return { tag: 'EnsureUserInRoomWithName', content: { name } };
}
export function mkAddChatMessage({ text }: { text: string }): Update {
  return { tag: 'AddChatMessage', content: { text } };
}
export function mkAddWord({ word }: { word: string }): Update {
  return { tag: 'AddWord', content: { word } };
}

export const UpdateForRoomT = t.type({
  update: UpdateT,
  room: t.string,
});
export type UpdateForRoom = t.TypeOf<typeof UpdateForRoomT>;

export function encodeUpdateForRoom(room: string, update: Update): any {
  return UpdateForRoomT.encode({ room, update });
}

export const UpdateFailedReasonT = t.union([
  t.literal('GameIsInProgress'),
  t.literal('NameAlreadyExists'),
  t.literal('UserDoesNotExist'),
  t.literal('WordAlreadyExists'),
]);
export type UpdateFailedReason = t.TypeOf<typeof UpdateFailedReasonT>;

export const UpdateErrorT = t.union([
  t.type({ tag: t.literal('DecodingFailed') }),
  t.type({
    tag: t.literal('UpdateFailed'),
    reason: UpdateFailedReasonT,
  }),
]);
export type UpdateError = t.TypeOf<typeof UpdateErrorT>;

export const UpdateResultT = mkEitherT(UpdateErrorT, t.literal('Ok'));
export type UpdateResult = t.TypeOf<typeof UpdateResultT>;
export const UpdateResultOk: UpdateResult = either.right('Ok');

export const HttpUpdateResultT = mkEitherT(t.literal('JsonParsingFailed'), UpdateResultT);
export type HttpUpdateResult = t.TypeOf<typeof HttpUpdateResultT>;
