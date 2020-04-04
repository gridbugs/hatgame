export type Message = 'MessageServerToClient';

export function toString(message: Message): string {
  return message;
}
