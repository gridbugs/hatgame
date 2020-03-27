import { UserUuid, isUserUuid } from './user_uuid';

export { UserUuid };

export interface Hello {
  userUuid: UserUuid;
}
export function isHello(obj: any): obj is Hello {
  return isUserUuid(obj.userUuid);
}
export function newHello(userUuid: UserUuid): Hello {
  return { userUuid };
}

export interface Result {
  success: boolean;
}
export function isResult(obj: any): obj is Result {
  return typeof obj.success === 'boolean';
}
export function newResult(success: boolean): Result {
  return { success };
}
