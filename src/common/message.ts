export interface Message {
  userUuid: string;
  text: string;
}

export function isMessage(obj: any): obj is Message {
  return typeof obj.userUuid === 'string' && typeof obj.text === 'string';
}
