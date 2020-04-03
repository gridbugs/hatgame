import { Map, List, Set } from 'immutable';
import { UserUuid, isUserUuid } from './user_uuid';
import { Nickname as foo } from './state-io';

console.log(foo);

export { UserUuid, isUserUuid };

export interface StateJS {
  userNicknames: Record<string, any>;
  chatMessages: ChatMessage[];
  userUuids: UserUuid[];
}
export function stateToStateJS(state: State): StateJS {
  const { userNicknames, chatMessages, userUuids } = state;
  return {
    userNicknames: userNicknames.toJS(),
    chatMessages: chatMessages.toJS(),
    userUuids: userUuids.toJS(),
  };
}
export function stateJSToState(state: StateJS): State {
  const { userNicknames, chatMessages, userUuids } = state;
  return {
    userNicknames: Map(userNicknames),
    chatMessages: List(chatMessages),
    userUuids: Set(userUuids),
  };
}
export function isStateJS(obj: any): obj is StateJS {
  return typeof obj.userNicknames === 'object' && typeof obj.chatMessages === 'object';
}

export type Nickname = string;
export function isNickname(obj: any): obj is Nickname {
  return typeof obj === 'string';
}

export type MessageText = string;
export function isMessageText(obj: any): obj is MessageText {
  return typeof obj === 'string';
}

export interface ChatMessage {
  readonly userUuid: UserUuid;
  readonly messageText: MessageText;
}
function isChatMessage(obj: any): obj is ChatMessage {
  return isUserUuid(obj.userUuid) && isMessageText(obj.messageText);
}

export type AddChatMessageLabel = 'AddChatMessage';
const ADD_CHAT_MESSAGE_LABEL: AddChatMessageLabel = 'AddChatMessage';
export interface AddChatMessage {
  readonly label: AddChatMessageLabel;
  readonly chatMessage: ChatMessage;
}
export function isAddChatMessage(obj: any): obj is AddChatMessage {
  return obj.label === ADD_CHAT_MESSAGE_LABEL && isChatMessage(obj.chatMessage);
}
export function mkAddChatMessage(userUuid: UserUuid, messageText: MessageText): AddChatMessage {
  return { label: ADD_CHAT_MESSAGE_LABEL, chatMessage: { userUuid, messageText } };
}

export type SetNicknameLabel = 'SetNickname';
const SET_NICKNAME: SetNicknameLabel = 'SetNickname';
export interface SetNickname {
  readonly label: SetNicknameLabel;
  readonly userUuid: UserUuid;
  readonly nickname: Nickname;
}
export function isSetNickname(obj: any): obj is SetNickname {
  return obj.label === SET_NICKNAME && isUserUuid(obj.userUuid) && isNickname(obj.nickname);
}
export function mkSetNickname(userUuid: UserUuid, nickname: Nickname): SetNickname {
  return { label: SET_NICKNAME, userUuid, nickname };
}

export type AddUserUuidLabel = 'AddUserUuid';
const ADD_USER_UUID_LABEL: AddUserUuidLabel = 'AddUserUuid';
export interface AddUserUuid {
  readonly label: AddUserUuidLabel;
  readonly userUuid: UserUuid;
}
export function isAddUserUuid(obj: any): obj is AddUserUuid {
  return obj.label === ADD_USER_UUID_LABEL && isUserUuid(obj.userUuid);
}
export function mkAddUserUuid(userUuid: UserUuid): AddUserUuid {
  return { label: ADD_USER_UUID_LABEL, userUuid };
}

export type RemoveUserUuidLabel = 'RemoveUserUuid';
const REMOVE_USER_UUID_LABEL: RemoveUserUuidLabel = 'RemoveUserUuid';
export interface RemoveUserUuid {
  readonly label: RemoveUserUuidLabel;
  readonly userUuid: UserUuid;
}
export function isRemoveUserUuid(obj: any): obj is RemoveUserUuid {
  return obj.label === REMOVE_USER_UUID_LABEL && isUserUuid(obj.userUuid);
}
export function mkRemoveUserUuid(userUuid: UserUuid): RemoveUserUuid {
  return { label: REMOVE_USER_UUID_LABEL, userUuid };
}

export type ReplaceStateLabel = 'ReplaceState';
const REPLACE_STATE_LABEL: ReplaceStateLabel = 'ReplaceState';
export interface ReplaceState {
  readonly label: ReplaceStateLabel;
  readonly state: StateJS;
}
export function isReplaceState(obj: any): obj is ReplaceState {
  return obj.label === REPLACE_STATE_LABEL && isStateJS(obj.state);
}
export function mkReplaceState(state: State): ReplaceState {
  return { label: REPLACE_STATE_LABEL, state: stateToStateJS(state) };
}

type Update = AddChatMessage | SetNickname | AddUserUuid | RemoveUserUuid | ReplaceState;
export function isUpdate(obj: any): obj is Update {
  return isAddChatMessage(obj)
    || isSetNickname(obj)
    || isAddUserUuid(obj)
    || isRemoveUserUuid(obj)
    || isReplaceState(obj);
}

export interface State {
  readonly userNicknames: Map<UserUuid, Nickname>;
  readonly chatMessages: List<ChatMessage>;
  readonly userUuids: Set<UserUuid>;
}
export const EMPTY_STATE: State = {
  userNicknames: Map(),
  chatMessages: List(),
  userUuids: Set(),
};
export function updateStateAddChatMessage(state: State, addChatMessage: AddChatMessage): State {
  const { chatMessages } = state;
  const { chatMessage } = addChatMessage;
  return { ...state, chatMessages: chatMessages.push(chatMessage) };
}
export function updateStateSetNickname(state: State, setNickname: SetNickname): State {
  const { userNicknames } = state;
  const { userUuid, nickname } = setNickname;
  return { ...state, userNicknames: userNicknames.set(userUuid, nickname) };
}
export function updateStateAddUserUuid(state: State, addUserUuid: AddUserUuid): State {
  const { userUuids } = state;
  const { userUuid } = addUserUuid;
  return { ...state, userUuids: userUuids.add(userUuid) };
}
export function updateStateRemoveUserUuid(state: State, removeUserUuid: RemoveUserUuid): State {
  const { userUuids } = state;
  const { userUuid } = removeUserUuid;
  return { ...state, userUuids: userUuids.remove(userUuid) };
}
export function updateStateReplaceState(_state: State, replaceState: ReplaceState): State {
  const { state: stateJS } = replaceState;
  return stateJSToState(stateJS);
}
export function updateState(state: State, update: Update): State {
  if (isAddChatMessage(update)) {
    return updateStateAddChatMessage(state, update);
  }
  if (isSetNickname(update)) {
    return updateStateSetNickname(state, update);
  }
  if (isAddUserUuid(update)) {
    return updateStateAddUserUuid(state, update);
  }
  if (isRemoveUserUuid(update)) {
    return updateStateRemoveUserUuid(state, update);
  }
  if (isReplaceState(update)) {
    return updateStateReplaceState(state, update);
  }
  // unreachable
  throw new Error('unreachable');
}
