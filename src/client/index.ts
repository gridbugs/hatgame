import { getPathnameFromRoomName } from './room_name';

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
