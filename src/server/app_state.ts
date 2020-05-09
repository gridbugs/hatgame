import socketIo from 'socket.io';
import sharedSession from 'express-socket.io-session';
import { Option, some, none } from 'fp-ts/lib/Option';
import Instance from './instance';
import * as s from '../common/state';

const RANDOM_NAME_LENGTH = 4;

function randomName(): string {
  return Math.random().toString(36).substring(2).substring(0, RANDOM_NAME_LENGTH);
}

export default class AppState {
  private instances: Map<string, Instance>;

  constructor(
    private socketServer: socketIo.Server,
    private socketSession: sharedSession.SocketIoSharedSessionMiddleware,
  ) {
    this.instances = new Map();
  }

  private ensureInstanceExists(name: string, host: s.UserUuid): Instance {
    const instance = this.instances.get(name);
    if (instance === undefined) {
      const socketNamespace = this.socketServer.of(name).use(this.socketSession);
      const newInstance = new Instance(socketNamespace, host);
      this.instances.set(name, newInstance);
      return newInstance;
    }
    return instance;
  }

  makeInstanceRandomName(host: s.UserUuid): Instance {
    for (;;) {
      const name = randomName();
      if (!this.instances.has(name)) {
        return this.ensureInstanceExists(name, host);
      }
    }
  }

  getInstance(name: string): Option<Instance> {
    const instance = this.instances.get(name);
    if (instance === undefined) {
      return none;
    }
    return some(instance);
  }
}
