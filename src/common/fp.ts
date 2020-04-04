import { Option, none, some } from 'fp-ts/lib/Option';
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
