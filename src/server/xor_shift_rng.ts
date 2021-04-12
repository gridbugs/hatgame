export class XorShiftRng {
  private readonly state: number;

  private constructor(state: number) {
    this.state = state;
  }

  public static withSeed(seed: number): XorShiftRng {
    if (!Number.isInteger(seed)) {
      throw new Error('seed must be integer');
    }
    if (seed === 0) {
      throw new Error('seed must be non-zero');
    }
    return new XorShiftRng(seed);
  }

  public static withRandomSeed(): XorShiftRng {
    for (;;) {
      // eslint-disable-next-line no-bitwise
      const seed = Math.floor(Math.random() * (1 << 31));
      if (seed !== 0) {
        return new XorShiftRng(seed);
      }
    }
  }

  public gen(): [XorShiftRng, number] {
    let x = this.state;
    // eslint-disable-next-line no-bitwise
    x ^= x << 13;
    // eslint-disable-next-line no-bitwise
    x ^= x >> 17;
    // eslint-disable-next-line no-bitwise
    x ^= x << 5;
    return [new XorShiftRng(x), x];
  }

  private static shuffleInPlace<T>(rng: XorShiftRng, data: T[]): XorShiftRng {
    let tmpRng = rng;
    for (let i = 0; i < data.length - 1; i += 1) {
      const [nextRng, num] = rng.gen();
      tmpRng = nextRng;
      const index = (num % (data.length - i)) + i;
      const tmp = data[index];
      // eslint-disable-next-line no-param-reassign
      data[index] = data[i];
      // eslint-disable-next-line no-param-reassign
      data[i] = tmp;
    }
    return tmpRng;
  }

  public shuffleInPlace<T>(data: T[]): XorShiftRng {
    return XorShiftRng.shuffleInPlace(this, data);
  }
}
