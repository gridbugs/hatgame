import * as i from 'immutable';
import { either } from 'fp-ts';
import {
  UserUuid, UserNamesByUuid, ChatMessage, Chat, CurrentUsers, WordBag, Word, WordList
} from '../common/types';
import * as m from '../common/model';

export * from '../common/types';

export type Team = i.List<UserUuid>;

export type Turn = {
  readonly teamIndexWithinTeams: number,
  readonly clueGiverIndexWithinTeam: number,
};

export type GameState = {
  readonly teams: i.List<Team>,
  readonly currentTurn: Turn,
  readonly wordBag: WordBag,
  readonly incorrectlyGuessedWordBag: WordBag,
  readonly correctlyGuessedWordsByUserUuid: i.Map<UserUuid, i.List<Word>>,
};

export type WordsByUserUuid = i.Map<UserUuid, WordList>;

export type LobbyState = {
  readonly wordsByUserUuid: WordsByUserUuid,
};

export type GameStateOrLobby = { tag: 'Lobby', state: LobbyState } | { tag: 'Game', state: GameState };

export type RoomStateObject = {
  userNamesByUuid: UserNamesByUuid,
  currentUsers: CurrentUsers,
  chat: Chat,
  gameStateOrLobby: GameStateOrLobby,
};

export class RoomState {
  private readonly userNamesByUuid: UserNamesByUuid;

  private readonly currentUsers: CurrentUsers;

  private readonly chat: Chat;

  private readonly gameStateOrLobby: GameStateOrLobby;

  private constructor({
    userNamesByUuid,
    currentUsers,
    chat,
    gameStateOrLobby,
  } : RoomStateObject) {
    this.userNamesByUuid = userNamesByUuid;
    this.currentUsers = currentUsers;
    this.chat = chat;
    this.gameStateOrLobby = gameStateOrLobby;
  }

  private toObject(): RoomStateObject {
    return {
      userNamesByUuid: this.userNamesByUuid,
      currentUsers: this.currentUsers,
      chat: this.chat,
      gameStateOrLobby: this.gameStateOrLobby,
    };
  }

  public static empty: RoomState = new RoomState({
    userNamesByUuid: i.Map(),
    currentUsers: i.Set(),
    chat: i.List(),
    gameStateOrLobby: { tag: 'Lobby', state: { wordsByUserUuid: i.Map() } },
  });

  public ensureUserInRoomWithName({
    userUuid, name, makeCurrent,
  }: {userUuid: UserUuid, name: string, makeCurrent: boolean}):
    either.Either<'GameIsInProgress' | 'NameAlreadyExists', RoomState> {
    switch (this.gameStateOrLobby.tag) {
      case 'Game': return either.left('GameIsInProgress');
      case 'Lobby': {
        const nameAlreadyExists = this.userNamesByUuid
          .find((existingUserName, existingUserUuid) => existingUserName === name && existingUserUuid !== userUuid);
        if (nameAlreadyExists) {
          return either.left('NameAlreadyExists');
        }
        const userNamesByUuid = this.userNamesByUuid.set(userUuid, name);
        return either.right(new RoomState({
          ...this.toObject(),
          userNamesByUuid,
          currentUsers: makeCurrent ? this.currentUsers.add(userUuid) : this.currentUsers,
        }));
      }
    }
  }

  public makeUserCurrent(userUuid: UserUuid): either.Either<'UserDoesNotExist', RoomState> {
    if (!this.userNamesByUuid.has(userUuid)) {
      return either.left('UserDoesNotExist');
    }
    return either.right(new RoomState({
      ...this.toObject(),
      currentUsers: this.currentUsers.add(userUuid),
    }));
  }

  public makeUserNotCurrent(userUuid: UserUuid): either.Either<'UserDoesNotExist', RoomState> {
    if (!this.userNamesByUuid.has(userUuid)) {
      return either.left('UserDoesNotExist');
    }
    return either.right(new RoomState({
      ...this.toObject(),
      currentUsers: this.currentUsers.remove(userUuid),
    }));
  }

  public addChatMessage(chatUpdate: ChatMessage): either.Either<'UserDoesNotExist', RoomState> {
    if (!this.userNamesByUuid.has(chatUpdate.userUuid)) {
      return either.left('UserDoesNotExist');
    }
    return either.right(new RoomState({
      ...this.toObject(),
      chat: this.chat.push(chatUpdate),
    }));
  }

  public setWords(userUuid: UserUuid, words: i.List<Word>):
    either.Either<'GameIsInProgress' | 'UserDoesNotExist', RoomState> {
    switch (this.gameStateOrLobby.tag) {
      case 'Game': return either.left('GameIsInProgress');
      case 'Lobby': {
        if (!this.userNamesByUuid.has(userUuid)) {
          return either.left('UserDoesNotExist');
        }
        return either.right(new RoomState({
          ...this.toObject(),
          gameStateOrLobby: {
            tag: 'Lobby',
            state: {
              wordsByUserUuid: this.gameStateOrLobby.state.wordsByUserUuid.set(
                userUuid, words
              ),
            },
          },
        }));
      }
    }
  }

  public toModel(userUuid: UserUuid): m.Model {
    switch (this.gameStateOrLobby.tag) {
      case 'Game': {
        return {
          tag: 'Game',
          content: {
            userNamesByUuid: this.userNamesByUuid,
            chat: this.chat,
          },
        };
      }
      case 'Lobby': {
        return {
          tag: 'Lobby',
          content: {
            userNamesByUuid: this.userNamesByUuid,
            currentUsers: this.currentUsers,
            chat: this.chat,
            numSubmittedWordsByUserUuid: this.gameStateOrLobby.state.wordsByUserUuid.map((w) => w.size),
            submittedWords: this.gameStateOrLobby.state.wordsByUserUuid.get(userUuid, i.List()),
          },
        };
      }
    }
  }
}
