import { Option, none, some } from 'fp-ts/lib/Option';
import { Either, isRight, right } from 'fp-ts/lib/Either';
import { either, EitherC } from 'io-ts-types/lib/either';
import * as i from 'immutable';
import * as t from 'io-ts';

export function mapGetOpt<K, V>(map: i.Map<K, V>, key: K): Option<V> {
  const value: V | null = map.get<null>(key, null);
  if (value === null) {
    return none;
  }
  return some(value);
}

export const UnitT = t.type({});
export type Unit = t.TypeOf<typeof UnitT>;
export const UNIT: Unit = {};
export const RIGHT_UNIT: Either<never, Unit> = right(UNIT);

export const ErrorT = new t.Type<Error, string, unknown>(
  'Error',
  (input: unknown): input is Error => input instanceof Error,
  (input, context) => {
    if (typeof input === 'string') {
      return t.success(new Error(input));
    }
    return t.failure(input, context);
  },
  (x) => x.message,
);

export function orError<C extends t.Mixed>(codec: C): EitherC<t.Type<Error, string, unknown>, C> {
  return either(ErrorT, codec);
}
export type OrError<T> = Either<Error, T>;

export const UnitOrErrorT = orError(UnitT);
export type UnitOrError = OrError<Unit>;

export function orErrorUnwrap<T>(e: OrError<T>): T {
  if (isRight(e)) {
    return e.right;
  }
  throw e.left;
}

export function sanitizeError(u: unknown): Error {
  if (u instanceof Error) {
    return u;
  }
  if (typeof u === 'string') {
    return new Error(u);
  }
  return new Error(`${u}`);
}

export function unimplemented(): any {
  throw new Error('unimplemented');
}
