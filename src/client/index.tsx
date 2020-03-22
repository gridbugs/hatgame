/** @jsx preactH */
import io from 'socket.io-client';
import { h as preactH, render } from 'preact';

const socket = io();

render(<h1>foo</h1>, document.body);

socket.emit('foo', { hello: 'world' });

socket.on('bar', (msg: any) => {
  console.log(msg);
});
