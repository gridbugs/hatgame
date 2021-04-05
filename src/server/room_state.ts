import * as i from 'immutable';
import { either } from 'fp-ts';
import {
  UserUuid, UserNamesByUuid, ChatMessage, Chat
} from '../common/types';
import * as m from '../common/model';

export * from '../common/types';

export type Team = i.List<UserUuid>;

export type Turn = {
  readonly teamIndexWithinTeams: number,
  readonly clueGiverIndexWithinTeam: number,
};

export type Word = string;

export type WordBag = i.List<Word>;

export type GameState = {
  readonly teams: i.List<Team>,
  readonly currentTurn: Turn,
  readonly wordBag: WordBag,
  readonly incorrectlyGuessedWordBag: WordBag,
  readonly correctlyGuessedWordsByUserUuid: i.Map<UserUuid, i.List<Word>>,
};

export type WordsByUserUuid = i.Map<UserUuid, i.Set<Word>>;
const WordSetEmpty = i.Set();

export type LobbyState = {
  readonly wordsByUserUuid: WordsByUserUuid,
};

export type GameStateOrLobby = { tag: 'Lobby', state: LobbyState } | { tag: 'Game', state: GameState };

export type RoomStateObject = {
  userNamesByUuid: UserNamesByUuid,
  chat: Chat,
  gameStateOrLobby: GameStateOrLobby,
};

export class RoomState {
  private readonly userNamesByUuid: UserNamesByUuid;

  private readonly chat: Chat;

  private readonly gameStateOrLobby: GameStateOrLobby;

  private constructor({
    userNamesByUuid,
    chat,
    gameStateOrLobby,
  } : RoomStateObject) {
    this.userNamesByUuid = userNamesByUuid;
    this.chat = chat;
    this.gameStateOrLobby = gameStateOrLobby;
  }

  private toObject(): RoomStateObject {
    return {
      userNamesByUuid: this.userNamesByUuid,
      chat: this.chat,
      gameStateOrLobby: this.gameStateOrLobby,
    };
  }

  public static empty: RoomState = new RoomState({
    userNamesByUuid: i.Map(),
    chat: i.List(),
    gameStateOrLobby: { tag: 'Lobby', state: { wordsByUserUuid: i.Map() } },
  });

  public ensureUserInRoomWithName(userUuid: UserUuid, name: string):
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
        }));
      }
    }
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

  public addWord(userUuid: UserUuid, word: Word):
    either.Either<'GameIsInProgress' | 'UserDoesNotExist' | 'WordAlreadyExists', RoomState> {
    switch (this.gameStateOrLobby.tag) {
      case 'Game': return either.left('GameIsInProgress');
      case 'Lobby': {
        if (!this.userNamesByUuid.has(userUuid)) {
          return either.left('UserDoesNotExist');
        }
        const userWords = this.gameStateOrLobby.state.wordsByUserUuid.get(userUuid, WordSetEmpty);
        if (userWords.has(word)) {
          return either.left('WordAlreadyExists');
        }
        return either.right(new RoomState({
          ...this.toObject(),
          gameStateOrLobby: {
            tag: 'Lobby',
            state: {
              wordsByUserUuid: this.gameStateOrLobby.state.wordsByUserUuid.set(
                userUuid, userWords.add(word)
              ),
            },
          },
        }));
      }
    }
  }

  public toModel(_currentUserUuid: UserUuid): m.Model {
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
            chat: this.chat,
          },
        };
      }
    }
  }
}
