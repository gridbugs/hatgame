/** @jsx preactH */
import {
  h as preactH,
  render,
} from 'preact';
import io from 'socket.io-client';
import { Provider } from 'react-redux';
import { createStore, Action } from 'redux';
import { either } from 'fp-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { AppComponent } from './components/app';
import * as m from '../common/model';
import * as u from '../common/update';
import { sendUpdateOrThrow } from './update';
import * as q from './query';
import { ModelUpdate } from '../common/model_update';

type AppAction = string;
type AppState = string;

function rootReducer(_state: AppState | undefined, _action: Action<AppAction>): AppState {
  return 'foo';
}

const store = createStore(rootReducer);

type ServerConnectionInterface = {
  sendUpdate: (update: u.Update) => Promise<void>,
  connect: (onModelUpdate: (model: m.Model) => void) => void,
};

function mkServerConnection(room: string): ServerConnectionInterface {
  return {
    sendUpdate: (update) => sendUpdateOrThrow({ room, update }),
    connect: (onModelUpdate: (model: m.Model) => void) => {
      const socketNamespace = `/${room}`;
      console.log(`connecting to socket: ${socketNamespace}`);
      const socket = io(socketNamespace);
      socket.on('connect', async () => {
        console.log(`connected to socket: ${socketNamespace}`);
        await sendUpdateOrThrow({
          room,
          update: u.mkEnsureUserInRoomWithName({
            name: `steve${Math.floor(Math.random() * 1000)}`,
          })
        });
      });
      socket.on(ModelUpdate, (modelEncoded: any) => {
        const modelEither = m.ModelT.decode(modelEncoded);
        if (either.isRight(modelEither)) {
          const model = modelEither.right;
          console.log(`model update: ${JSON.stringify(model)}`);
          onModelUpdate(model);
        } else {
          const errorMessage = PathReporter.report(modelEither).join('');
          throw new Error(errorMessage);
        }
      });
    },
  };
}

function roomNameFromUrl(): string {
  const roomNameMatches = window.location.href.match(/\/game\/([a-zA-Z0-9-_]+)/);
  if (roomNameMatches === null) {
    throw new Error('failed to extract room name from url');
  }
  return roomNameMatches[1];
}

window.onload = async () => {
  const room = roomNameFromUrl();
  const currentUserUuid = await q.currentUserUuid();
  const serverConnection = mkServerConnection(room);
  const container = document.getElementById('container');
  if (container !== null) {
    render(
      <Provider store={store}>
        <div>
          <AppComponent currentUserUuid={currentUserUuid} serverConnection={serverConnection} />
        </div>
      </Provider>,
      container
    );
  }
};
