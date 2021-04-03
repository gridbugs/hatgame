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
import {
  AppComponent,
  ServerConnectionInterface,
  ServerConnectionInterfaceConnectCallbacks,
} from './components/app';
import * as m from '../common/model';
import { sendUpdateOrThrow } from './update';
import * as q from '../common/query';
import { ModelUpdate } from '../common/model_update';
import * as u from '../common/update';

type AppAction = string;
type AppState = string;

function rootReducer(_state: AppState | undefined, _action: Action<AppAction>): AppState {
  return 'foo';
}

const store = createStore(rootReducer);

function mkServerConnection(room: string): ServerConnectionInterface {
  return {
    sendUpdate: (update) => sendUpdateOrThrow({ room, update }),
    connect: ({ onInit, onModelUpdate }: ServerConnectionInterfaceConnectCallbacks) => {
      const socketNamespace = `/room/${room}`;
      console.log(`connecting to socket: ${socketNamespace}`);
      const socket = io(socketNamespace);
      socket.on('connect', async () => {
        console.log(`connected to socket: ${socketNamespace}`);
        socket.emit(q.GetCurrentUserUuid, (userUuidEncoded: any) => {
          const userUuidEither = m.UserUuidT.decode(userUuidEncoded);
          if (either.isRight(userUuidEither)) {
            const userUuid = userUuidEither.right;
            socket.emit(q.GetModel, async (modelEncoded: any) => {
              const modelEither = m.ModelT.decode(modelEncoded);
              if (either.isRight(modelEither)) {
                const model = modelEither.right;
                console.log(`model update: ${JSON.stringify(model)}`);
                onInit({ currentUserUuid: userUuid, model });
                await sendUpdateOrThrow({
                  room,
                  update: u.mkEnsureUserInRoomWithName({
                    name: `steve${Math.floor(Math.random() * 1000)}`,
                  })
                });
              } else {
                const errorMessage = PathReporter.report(modelEither).join('');
                throw new Error(errorMessage);
              }
            });
          } else {
            const errorMessage = PathReporter.report(userUuidEither).join('');
            throw new Error(errorMessage);
          }
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
  const serverConnection = mkServerConnection(room);
  const container = document.getElementById('container');
  if (container !== null) {
    render(
      <Provider store={store}>
        <div>
          <AppComponent serverConnection={serverConnection} />
        </div>
      </Provider>,
      container
    );
  }
};
