/** @jsx preactH */
import {
  h as preactH,
  render,
} from 'preact';
import io from 'socket.io-client';
import { Provider } from 'react-redux';
import { createStore, Action } from 'redux';
import * as m from '../common/message';

type AppAction = string;
type AppState = string;

function rootReducer(_state: AppState | undefined, _action: Action<AppAction>): AppState {
  return 'foo';
}

const store = createStore(rootReducer);

window.onload = async () => {
  const container = document.getElementById('container');
  if (container !== null) {
    const socket = io();
    render(
      <Provider store={store}>
        <div>
          <h2>hi</h2>
          <div id="chat-log"></div>
          <input id="chat-input"></input>
          <input type="button" value="Send" onClick={() => {
            socket.emit('message', m.encodeMessageForRoom('foo', m.mkAddChatMessage('Hello, World!')));
          }}></input>
        </div>
      </Provider>,
      container
    );
  }
};
