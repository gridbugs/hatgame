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
import { sendUpdate } from './update';
import * as w from '../common/websocket_api';
import { ModelUpdate } from '../common/model_update';
import * as u from '../common/update';

type AppAction = string;
type AppState = string;

function rootReducer(_state: AppState | undefined, _action: Action<AppAction>): AppState {
  return 'foo';
}

const store = createStore(rootReducer);

function mkServerConnection(socket: SocketIOClient.Socket): ServerConnectionInterface {
  return {
    sendUpdate: (update) => sendUpdate({ socket, update }),
    connect: ({ onInit, onModelUpdate }: ServerConnectionInterfaceConnectCallbacks) => {
      socket.emit(w.GetCurrentUserUuid, (userUuidEncoded: any) => {
        const userUuidEither = m.UserUuidT.decode(userUuidEncoded);
        if (either.isRight(userUuidEither)) {
          const userUuid = userUuidEither.right;
          console.log(`current user uuid: ${userUuid}`);
          socket.emit(w.GetModel, async (modelEncoded: any) => {
            const modelEither = m.ModelT.decode(modelEncoded);
            if (either.isRight(modelEither)) {
              const model = modelEither.right;
              console.log(`model update: ${JSON.stringify(model)}`);
              onInit({ currentUserUuid: userUuid, model });
              await sendUpdate({
                socket,
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
  const container = document.getElementById('container');
  if (container !== null) {
    const socketNamespace = `/room/${room}`;
    console.log(`connecting to socket: ${socketNamespace}`);
    const socket = io(socketNamespace);
    socket.on('connect', () => {
      const serverConnection = mkServerConnection(socket);
      render(
      <Provider store={store}>
        <div>
          <AppComponent serverConnection={serverConnection} />
        </div>
      </Provider>,
      container
      );
    });
  }
};
