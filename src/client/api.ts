import * as api from '../common/api';

export async function hello(room: string): Promise<api.Hello> {
  const obj = await (await fetch(`/api/hello/${room}`)).json();
  if (api.isHello(obj)) {
    return obj;
  }
  throw new Error('type error');
}

export async function message(room: string, text: string): Promise<void> {
  const escaapedText = encodeURIComponent(text);
  const obj = await (await fetch(`/api/message/${room}/${escaapedText}`)).json();
  if (api.isResult(obj)) {
    if (!obj.success) {
      console.error('failed to send message', text);
    }
    return;
  }
  throw new Error('type error');
}

export async function setNickname(room: string, nickname: string): Promise<boolean> {
  const escapedNickname = encodeURIComponent(nickname);
  const obj = await (await fetch(`/api/setnickname/${room}/${escapedNickname}`)).json();
  if (api.isResult(obj)) {
    if (!obj.success) {
      console.error('failed to set nickname', nickname);
    }
    return obj.success;
  }
  throw new Error('type error');
}
