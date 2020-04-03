import { getPathnameFromRoomName } from './room_name';
import * as u from '../common/update';
import * as s from '../common/state-io';

console.log(u.SetNicknameT.encode({
  tag: 'SetNickname',
  userUuid: new s.UserUuid('foo'),
  nickname: new s.Nickname('bar'),
}));

const room = document.getElementById('room');
const join = document.getElementById('join');

function go(): void {
  if (room instanceof HTMLInputElement) {
    const pathname = getPathnameFromRoomName(room.value);
    if (pathname !== null) {
      window.location.href = pathname;
    }
  }
}

if (room !== null && join !== null) {
  join.addEventListener('click', go);
  room.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      go();
    }
  });
}
