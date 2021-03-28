/** @jsx preactH */
import {
  h as preactH,
  render,
} from 'preact';
//import io from 'socket.io-client';
import { Provider } from 'react-redux';
import { createStore, Action } from 'redux';
import { either as mkEitherT } from 'io-ts-types/lib/either';
import * as t from 'io-ts';
import { either } from 'fp-ts';
import * as e from '../common/error';
import * as m from '../common/message';

type AppAction = string;
type AppState = string;

function rootReducer(_state: AppState | undefined, _action: Action<AppAction>): AppState {
  return 'foo';
}

const store = createStore(rootReducer);

async function sendMessage(message: m.Message): Promise<t.Validation<either.Either<e.Error, 'ok'>>> {
  const messageEncoded = m.encodeMessageForRoom('foo', message);
  const messageEscaped = encodeURIComponent(JSON.stringify(messageEncoded));
  const result = await (await fetch(`/api/${messageEscaped}`)).json();
  return mkEitherT(e.ErrorT, t.literal('ok')).decode(result);
}

window.onload = async () => {
  const container = document.getElementById('container');
  if (container !== null) {
    //const socket = io();
    render(
      <Provider store={store}>
        <div>
          <h2>hi</h2>
          <div id="chat-log"></div>
          <input id="chat-input"></input>
          <input type="button" value="Send" onClick={async () => {
            console.log(await sendMessage(m.mkEnsureUserInRoomWithName({ name: 'steve' })));
            console.log(await sendMessage(m.mkAddChatMessage({ text: 'hi' })));
            console.log(await sendMessage(m.mkAddWord({ word: 'foo' })));
            console.log(await sendMessage(m.mkAddWord({ word: 'bar' })));
            console.log(await sendMessage(m.mkAddWord({ word: 'foo' })));
          }}></input>
        </div>
      </Provider>,
      container
    );
  }
};
