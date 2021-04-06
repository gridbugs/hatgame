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
  joinButton.disabled = false;
  joinButton.value = 'Join';
  const submit = async (): Promise<void> => {
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
  };
  const submitOnEnter = async (event: KeyboardEvent): Promise<void> => {
    if (event.key === 'Enter') {
      submit();
    }
  };
  codeText.addEventListener('keypress', submitOnEnter);
  nameText.addEventListener('keypress', submitOnEnter);
  joinButton.addEventListener('click', submit);
};

window.onunload = () => {
  // this is here so when navigating back to the join page causes the form to reset
};
