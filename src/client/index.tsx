/** @jsx preactH */
import io from 'socket.io-client';
import { h as preactH, render } from 'preact';
import Chat from './chat';

const socket = io(window.location.pathname);

const container = document.getElementById('container');
if (container !== null) {
  render(<div><Chat /></div>, container);
}

socket.emit('foo', { hello: 'world' });

socket.on('bar', (msg: any) => {
  console.log(msg);
});
