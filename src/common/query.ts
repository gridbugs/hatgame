export type Query = 'CurrentUserUuid';

export function path(arg: Query): string {
  return `/query/${arg}`;
}
