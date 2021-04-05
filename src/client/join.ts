import { sendUpdateSocketHttp } from './update';
import * as u from '../common/update';

window.onload = () => {
  const joinButton = document.getElementById('join-button');
  const codeText = document.getElementById('code-text');
  const nameText = document.getElementById('name-text');
  if (!(joinButton instanceof HTMLInputElement)
    || !(codeText instanceof HTMLInputElement)
    || !(nameText instanceof HTMLInputElement)) {
    throw new Error('missing input elements');
  }
  joinButton.addEventListener('click', async () => {
    const code = codeText.value;
    const name = nameText.value;
    joinButton.disabled = true;
    joinButton.value = 'Joining...';
    try {
      await sendUpdateSocketHttp({
        room: code,
        update: u.mkEnsureUserInRoomWithName({ name }),
      });
      window.location.href = `/game/${code}`;
    } catch {
      joinButton.disabled = false;
      joinButton.value = 'Join';
    }
  });
};
