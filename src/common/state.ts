import { Map, List } from 'immutable';

export interface StateJS {
  userNicknames: Record<string, any>;
  chatMessages: ChatMessage[];
}
export function stateToStateJS(state: State): StateJS {
  const { userNicknames, chatMessages } = state;
  return {
    userNicknames: userNicknames.toJS(),
    chatMessages: chatMessages.toJS(),
  };
}
export function stateJSToState(state: StateJS): State {
  const { userNicknames, chatMessages } = state;
  return {
    userNicknames: Map(userNicknames),
    chatMessages: List(chatMessages),
  };
}

type UserUuid = string;
export function isUserUuid(obj: any): obj is UserUuid {
  return typeof obj === 'string';
}

type Nickname = string;
export function isNickname(obj: any): obj is Nickname {
  return typeof obj === 'string';
}

type MessageText = string;
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
export function newAddChatMessage(userUuid: UserUuid, messageText: MessageText): AddChatMessage {
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

export type ReplaceStateLabel = 'ReplaceState';
const REPLACE_STATE_LABEL: ReplaceStateLabel = 'ReplaceState';
export interface ReplaceState {
  readonly label: ReplaceStateLabel;
  readonly state: StateJS;
}
export function isReplaceState(obj: any): obj is ReplaceState {
  return obj.label === REPLACE_STATE_LABEL;
}
export function newReplaceState(state: State): ReplaceState {
  return { label: REPLACE_STATE_LABEL, state: stateToStateJS(state) };
}

type Update = AddChatMessage | SetNickname | ReplaceState;
export function isUpdate(obj: any): obj is Update {
  return isAddChatMessage(obj) || isSetNickname(obj) || isReplaceState(obj);
}

export interface State {
  readonly userNicknames: Map<UserUuid, Nickname>;
  readonly chatMessages: List<ChatMessage>;
}
export const EMPTY_STATE: State = {
  userNicknames: Map(),
  chatMessages: List(),
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
  if (isReplaceState(update)) {
    return updateStateReplaceState(state, update);
  }
  // unreachable
  return state;
}
