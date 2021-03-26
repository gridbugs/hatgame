/** @jsx preactH */
import {
  h as preactH,
  render,
} from 'preact';
import io from 'socket.io-client';
import * as m from '../common/message';

window.onload = async () => {
  const container = document.getElementById('container');
  if (container !== null) {
    const socket = io();
    render(
      <div>
        <h2>hi</h2>
        <div id="chat-log"></div>
        <input id="chat-input"></input>
        <input type="button" value="Send" onClick={() => {
          socket.emit('message', m.AddChatMessageT.encode(m.mkAddChatMessage('Hello, World!')));
        }}></input>
      </div>,
      container
    );
  }
};
