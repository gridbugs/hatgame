import * as i from 'immutable';
import { either } from 'fp-ts';

export type UserUuid = string;

export type User = {
  readonly name: string,
  readonly uuid: UserUuid,
};

export type UsersByUuid = i.Map<UserUuid, User>;

export type ChatMessage = {
  readonly userUuid: UserUuid,
  readonly text: string,
};

export type Chat = i.List<ChatMessage>;

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

export type LobbyState = {
  readonly wordsByUserUuid: WordsByUserUuid,
};

export type GameStateOrLobby = { tag: 'Lobby', state: LobbyState } | { tag: 'Game', state: GameState };

export type RoomStateObject = {
  usersByUuid: UsersByUuid,
  chat: Chat,
  gameStateOrLobby: GameStateOrLobby,
};

export class RoomState {
  private readonly usersByUuid: UsersByUuid;

  private readonly chat: Chat;

  private readonly gameStateOrLobby: GameStateOrLobby;

  private constructor({
    usersByUuid,
    chat,
    gameStateOrLobby,
  } : RoomStateObject) {
    this.usersByUuid = usersByUuid;
    this.chat = chat;
    this.gameStateOrLobby = gameStateOrLobby;
  }

  private toObject(): RoomStateObject {
    return {
      usersByUuid: this.usersByUuid,
      chat: this.chat,
      gameStateOrLobby: this.gameStateOrLobby,
    };
  }

  public static empty: RoomState = new RoomState({
    usersByUuid: i.Map(),
    chat: i.List(),
    gameStateOrLobby: { tag: 'Lobby', state: { wordsByUserUuid: i.Map() } },
  });

  public addUser(user: User):
    either.Either<'GameIsInProgress' | 'UserUuidAlreadyExists' | 'NameAlreadyExists', RoomState> {
    switch (this.gameStateOrLobby.tag) {
      case 'Game': return either.left('GameIsInProgress');
      case 'Lobby': {
        if (this.usersByUuid.has(user.uuid)) {
          return either.left('UserUuidAlreadyExists');
        }
        const nameAlreadyExists = this.usersByUuid.valueSeq().find((existingUser) => existingUser.name === user.name);
        if (nameAlreadyExists) {
          return either.left('NameAlreadyExists');
        }
        const usersByUuid = this.usersByUuid.set(user.uuid, user);
        return either.right(new RoomState({
          ...this.toObject(),
          usersByUuid,
        }));
      }
    }
  }

  public setUserName(userUuid: UserUuid, name: string):
    either.Either<'GameIsInProgress' | 'UserUuidDoesNotExist' | 'NameAlreadyExists', RoomState> {
    switch (this.gameStateOrLobby.tag) {
      case 'Game': return either.left('GameIsInProgress');
      case 'Lobby': {
        const currentUser = this.usersByUuid.get(userUuid);
        if (currentUser === undefined) {
          return either.left('UserUuidDoesNotExist');
        }
        const nameAlreadyExists = this.usersByUuid.valueSeq()
          .find((existingUser) => existingUser.name === name && existingUser.uuid !== currentUser.uuid);
        if (nameAlreadyExists) {
          return either.left('NameAlreadyExists');
        }
        const usersByUuid = this.usersByUuid.set(currentUser.uuid, { ...currentUser, name });
        return either.right(new RoomState({
          ...this.toObject(),
          usersByUuid,
        }));
      }
    }
  }

  public addChatMessage(chatMessage: ChatMessage): RoomState {
    return new RoomState({
      ...this.toObject(),
      chat: this.chat.push(chatMessage),
    });
  }

  public addWord(userUuid: UserUuid, word: Word):
    either.Either<'GameIsInProgress' | 'UserDoesNotExist' | 'WordAlreadyExists', RoomState> {
    switch (this.gameStateOrLobby.tag) {
      case 'Game': return either.left('GameIsInProgress');
      case 'Lobby': {
        const userWords = this.gameStateOrLobby.state.wordsByUserUuid.get(userUuid);
        if (userWords === undefined) {
          return either.left('UserDoesNotExist');
        }
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
}