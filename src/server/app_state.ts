import * as i from 'immutable';
import { RoomState } from './room_state';

export type RoomsByName = i.Map<string, RoomState>;

export class AppState {
  private readonly roomsByName: RoomsByName;

  private constructor({ roomsByName }: { roomsByName: RoomsByName }) {
    this.roomsByName = roomsByName;
  }

  public static empty: AppState = new AppState({ roomsByName: i.Map() });

  public updateRoomState(name: string, f: (s: RoomState) => RoomState): AppState {
    return new AppState({
      roomsByName: this.roomsByName.update(name, RoomState.empty, f),
    });
  }
}
