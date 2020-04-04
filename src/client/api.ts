import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { either } from 'io-ts-types/lib/either';
import * as api from '../common/api';
import { UnitT } from '../common/fp';

export async function hello(room: string): Promise<api.Hello> {
  const helloEither = api.HelloT.decode(await (await fetch(`/api/hello/${room}`)).json());
  if (isRight(helloEither)) {
    return helloEither.right;
  }
  console.log(helloEither);
  throw new Error('type error');
}

export async function message(room: string, text: string): Promise<void> {
  const escaapedText = encodeURIComponent(text);
  const result = either(t.string, UnitT).decode(
    await (await fetch(`/api/message/${room}/${escaapedText}`)).json(),
  );
  if (isRight(result)) {
    if (isRight(result.right)) {
      return;
    }
    throw new Error(result.right.left);
  }
  throw new Error('type error');
}

export async function setNickname(room: string, nickname: string): Promise<void> {
  const escapedNickname = encodeURIComponent(nickname);
  const result = either(t.string, UnitT).decode(
    await (await fetch(`/api/setnickname/${room}/${escapedNickname}`)).json(),
  );
  if (isRight(result)) {
    if (isRight(result.right)) {
      return;
    }
    throw new Error(result.right.left);
  }
  throw new Error('type error');
}
