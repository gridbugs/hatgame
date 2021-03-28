import * as t from 'io-ts';

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

export const MessageT = t.union([
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
export type Message = t.TypeOf<typeof MessageT>;

export function mkEnsureUserInRoomWithName({ name }: { name: string }): Message {
  return { tag: 'EnsureUserInRoomWithName', content: { name } };
}
export function mkAddChatMessage({ text }: { text: string }): Message {
  return { tag: 'AddChatMessage', content: { text } };
}
export function mkAddWord({ word }: { word: string }): Message {
  return { tag: 'AddWord', content: { word } };
}

export const MessageForRoomT = t.type({
  message: MessageT,
  room: t.string,
});
export type MessageForRoom = t.TypeOf<typeof MessageForRoomT>;

export function encodeMessageForRoom(room: string, message: Message): any {
  return MessageForRoomT.encode({ room, message });
}
