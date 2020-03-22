/** @jsx preactH */
import io from 'socket.io-client';
import { h as preactH, render } from 'preact';
import player from '../common/player';

const socket = io();

const p = new player.Player('bar');

console.log(p);

render(<h1>foo</h1>, document.body);

socket.emit('foo', { hello: 'world' });

socket.on('bar', (msg: any) => {
  console.log(msg);
});
