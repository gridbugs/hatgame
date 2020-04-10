import * as t from 'io-ts';
import { isRight, left } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as api from '../common/api';
import {
  sanitizeError,
  UnitOrErrorT,
  UnitOrError,
  OrError,
} from '../common/fp';

async function stringApiCall<A, O, I>(
  codec: t.Type<A, O, I>,
  name: string,
  ...args: string[]
): Promise<OrError<A>> {
  try {
    const escapedName = encodeURIComponent(name);
    const escapedArgs = args.map(encodeURIComponent);
    const url = `/api/${[escapedName, ...escapedArgs].join('/')}`;
    const result = codec.decode(await (await fetch(url)).json());
    if (isRight(result)) {
      return result;
    }
    const errorMessage = PathReporter.report(result).join('');
    return left(new Error(errorMessage));
  } catch (error) {
    return left(sanitizeError(error));
  }
}

export function hello(room: string): Promise<OrError<api.Hello>> {
  return stringApiCall(api.HelloT, 'hello', room);
}

export function message(room: string, text: string): Promise<UnitOrError> {
  return stringApiCall(UnitOrErrorT, 'message', room, text);
}

export function setNickname(room: string, nickname: string): Promise<UnitOrError> {
  return stringApiCall(UnitOrErrorT, 'setnickname', room, nickname);
}
