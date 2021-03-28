import * as t from 'io-ts';

export const ErrorT = t.union([
  t.type({ tag: t.literal('GameIsInProgress') }),
  t.type({ tag: t.literal('NameAlreadyExists') }),
  t.type({ tag: t.literal('UserDoesNotExist') }),
  t.type({ tag: t.literal('WordAlreadyExists') }),
  t.type({ tag: t.literal('DecodingFailed') }),
  t.type({ tag: t.literal('JsonParsingFailed') }),
]);
export type Error = t.TypeOf<typeof ErrorT>;
