import GameInstance from '../common/game_instance';

export default class AppState {
  private instances: Map<string, GameInstance>;

  constructor() {
    this.instances = new Map();
  }

  instance(id: string): GameInstance {
    let instance = this.instances.get(id);
    if (instance === undefined) {
      instance = new GameInstance();
      this.instances.set(id, instance);
    }
    return instance;
  }
}
