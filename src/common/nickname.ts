export const ILLEGAL_RAW: Set<string> = new Set([
  "anonymous",
  "",
]);

export class Nickname {
  private constructor(private raw: string) {
    if (ILLEGAL_RAW.has(raw)) {
      throw new Error("illegal value");
    }
  }
}
