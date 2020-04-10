/** @jsx preactH */
import { h as preactH, render } from 'preact';
import Chat from './chat';
import { getRoomNameFromPathname } from './room_name';
import * as api from './api';
import { orErrorUnwrap } from '../common/fp';

window.onload = async () => {
  const container = document.getElementById('container');
  const roomName = getRoomNameFromPathname(window.location.pathname);
  if (container !== null) {
    if (roomName === null) {
      render(<p>Unable to read room name!</p>, container);
    } else {
      const { userUuid } = orErrorUnwrap(await api.hello(roomName));
      render(<div><Chat roomName={roomName} userUuid={userUuid}/></div>, container);
    }
  }
};
