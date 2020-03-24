import { Map, List } from 'immutable';

type UserUuid = string;
function isUserUuid(obj: any): obj is UserUuid {
  return typeof obj === 'string';
}

type Nickname = string;
function isNickname(obj: any): obj is Nickname {
  return typeof obj === 'string';
}

type MessageText = string;
function isMessageText(obj: any): obj is MessageText {
  return typeof obj === 'string';
}

export interface ChatMessage {
  userUuid: UserUuid;
  messageText: MessageText;
}
function isChatMessage(obj: any): obj is ChatMessage {
  return isUserUuid(obj.userUuid) && isMessageText(obj.messageText);
}

export interface State {
  nicknames: Map<UserUuid, Nickname>,
  messages: List<ChatMessage>,
}

export type AddChatMessageLabel = 'AddChatMessage';
const ADD_CHAT_MESSAGE_LABEL: AddChatMessageLabel = 'AddChatMessage';

export interface AddChatMessage {
  label: AddChatMessageLabel,
  chatMessage: ChatMessage,
}
export function isAddChatMessage(obj: any): obj is AddChatMessage {
  return obj.label === ADD_CHAT_MESSAGE_LABEL && isChatMessage(obj.chatMessage);
}

export type SetNicknameLabel = 'SetNickname';
const SET_NICKNAME: SetNicknameLabel = 'SetNickname';

export interface SetNickname {
  label: SetNicknameLabel,
  userUuid: UserUuid,
  nickname: Nickname,
}
export function isSetNickname(obj: any): obj is SetNickname {
  return obj.label === SET_NICKNAME && isUserUuid(obj.userUuid) && isNickname(obj.nickname);
}

type Update = AddChatMessage | SetNickname;
export function isUpdate(obj: any): obj is Update {
  return isAddChatMessage(obj) || isSetNickname(obj);
}
