import * as t from 'io-ts';

export const AddChatMessageT = t.type({
  tag: t.literal('AddChatMessage'),
  text: t.string,
});
export type AddChatMessage = t.TypeOf<typeof AddChatMessageT>;
export function mkAddChatMessage(text: string): AddChatMessage {
  return { tag: 'AddChatMessage', text };
}

export const AddWordT = t.type({
  tag: t.literal('AddWord'),
  text: t.string,
});
export type AddWord = t.TypeOf<typeof AddWordT>;
export function mkAddWord(text: string): AddWord {
  return { tag: 'AddWord', text };
}

export const MessageT = t.union([
  AddChatMessageT,
  AddWordT,
]);
