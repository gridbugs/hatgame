export function getRoomNameFromPathname(pathname: string): string | null {
  const matches = pathname.match(/\/room\/([a-zA-Z0-9-_]+)/);
  if (matches === null) {
    return null;
  }
  const channel = matches[1];
  if (channel === undefined) {
    return null;
  }
  return channel;
}

export function getGameRoomNameFromPathname(pathname: string): string | null {
  const matches = pathname.match(/\/game\/([a-zA-Z0-9-_]+)/);
  if (matches === null) {
    return null;
  }
  const channel = matches[1];
  if (channel === undefined) {
    return null;
  }
  return channel;
}

function isValidRoomName(roomName: string): boolean {
  return /^[a-zA-Z0-9-_]+/.test(roomName);
}

export function getPathnameFromRoomName(roomName: string): string | null {
  if (isValidRoomName(roomName)) {
    return `/room/${roomName}`;
  }
  return null;
}


export function getGamePathnameFromRoomName(roomName: string): string | null {
  if (isValidRoomName(roomName)) {
    return `/game/${roomName}`;
  }
  return null;
}
