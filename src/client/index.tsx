/** @jsx preactH */
import { Map } from 'immutable';
import io from 'socket.io-client';
import { h as preactH, render } from 'preact';
import Chat from './chat';

function connect(): SocketIOClient.Socket | null {
  const matches = window.location.pathname.match(/(\/[a-zA-Z0-9-_ /]+)/);
  if (matches === null) {
    return null;
  }
  const channel = matches[1];
  if (channel === undefined) {
    return null;
  }
  console.log(channel);
  return io(channel);
}

const container = document.getElementById('container');
const socket = connect();

if (container !== null) {
  if (socket === null) {
    render(<p>Unable to connect to server!</p>, container);
  } else {
    render(<div><Chat socket={socket}/></div>, container);
  }
}

const x = Map();
const y = x.set({ uuid: 'foo' }, 'world');
console.log(y.get({ uuid: 'foo' }));
console.log(y);
