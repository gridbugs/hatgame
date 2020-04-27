import * as api from './api';
import { orErrorUnwrap } from '../common/fp';
import { getGamePathnameFromRoomName } from './room_name';

const yourNameField = document.getElementById('your-name');
const createGameButton = document.getElementById('create-game');

async function go(): Promise<void> {
  if (yourNameField instanceof HTMLInputElement) {
    const yourName = yourNameField.value;
    const { userUuid } = orErrorUnwrap(await api.hello());
    console.log('userUuid', userUuid.toString());
    const roomName = orErrorUnwrap(await api.create());
    console.log('roomName', roomName);
    orErrorUnwrap(await api.setNickname(roomName, yourName));
    const pathname = getGamePathnameFromRoomName(roomName);
    if (pathname !== null) {
      window.location.href = pathname;
    }
  }
}

if (yourNameField !== null && createGameButton !== null) {
  createGameButton.addEventListener('click', go);
  yourNameField.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      go();
    }
  });
}
