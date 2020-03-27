export type UserUuid = string;
export function isUserUuid(obj: any): obj is UserUuid {
  return typeof obj === 'string';
}
