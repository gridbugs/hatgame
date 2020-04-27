import * as t from 'io-ts';
import { isRight, left, flatten } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as api from '../common/api';
import {
  sanitizeError,
  UnitOrErrorT,
  UnitT,
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
    const response = await (await fetch(url)).json();
    const result = codec.decode(response);
    if (isRight(result)) {
      return result;
    }
    const errorMessage = PathReporter.report(result).join('');
    return left(new Error(errorMessage));
  } catch (error) {
    return left(sanitizeError(error));
  }
}

export function hello(): Promise<OrError<api.Hello>> {
  return stringApiCall(api.HelloT, 'hello');
}

export function create(): Promise<OrError<string>> {
  return stringApiCall(t.string, 'create');
}

export function ensure(room: string): Promise<UnitOrError> {
  return stringApiCall(UnitT, 'ensure', room);
}

export async function message(room: string, text: string): Promise<UnitOrError> {
  return flatten(await stringApiCall(UnitOrErrorT, 'message', room, text));
}

export async function setNickname(room: string, nickname: string): Promise<UnitOrError> {
  return flatten(await stringApiCall(UnitOrErrorT, 'setnickname', room, nickname));
}
