import * as i from 'immutable';
import { XorShiftRng } from './xor_shift_rng';

export function shuffleList<T>(rng: XorShiftRng, list: i.List<T>): [XorShiftRng, i.List<T>] {
  const array = list.toArray();
  const nextRng = rng.shuffleInPlace(array);
  return [nextRng, i.List(array)];
}
