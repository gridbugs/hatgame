import * as i from 'immutable';
import { either } from 'fp-ts';
import { RoomState } from './room_state';

export type RoomsByName = i.Map<string, RoomState>;

export type RoomUpdate = {
  // eslint-disable-next-line no-use-before-define
  appState: AppState,
  roomState: RoomState,
};

export class AppState {
  private readonly roomsByName: RoomsByName;

  private constructor({ roomsByName }: { roomsByName: RoomsByName }) {
    this.roomsByName = roomsByName;
  }

  public static empty: AppState = new AppState({ roomsByName: i.Map() });

  public tryUpdateRoomState<L>(name: string, f: (s: RoomState) => either.Either<L, RoomState>):
    either.Either<L, RoomUpdate> {
    const current = this.roomsByName.get(name, RoomState.empty());
    const result = f(current);
    if (either.isLeft(result)) {
      return either.left(result.left);
    }
    return either.right({
      appState: new AppState({
        roomsByName: this.roomsByName.set(name, result.right),
      }),
      roomState: result.right,
    });
  }

  public getRoomState(name: string): RoomState {
    return this.roomsByName.get(name, RoomState.empty());
  }
}
