/** @jsx preactH */
import {
  h as preactH,
  render,
  Component,
  ComponentChild,
} from 'preact';
import io from 'socket.io-client';
import Chat from './chat_component';
import { getGameRoomNameFromPathname } from './room_name';
import * as api from './api';
import { orErrorUnwrap } from '../common/fp';
import * as s from '../common/state';

window.onload = async () => {
  const container = document.getElementById('container');
  const roomName = getGameRoomNameFromPathname(window.location.pathname);
  if (container !== null) {
    if (roomName === null) {
      render(<p>Unable to read game name!</p>, container);
    } else {
      const { userUuid } = orErrorUnwrap(await api.hello());
      console.log(userUuid);
      orErrorUnwrap(await api.ensure(roomName));
      render(<div><Game roomName={roomName} userUuid={userUuid}/></div>, container);
    }
  }
};

interface Props {
  roomName: string;
  userUuid: s.UserUuid;
}

interface State {
  gameState: s.State;
}

class Game extends Component<Props, State> {
  private socket: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.state = {
      gameState: s.EMPTY_STATE,
    };
    this.socket = io(`/${props.roomName}`);
  }

  render(): ComponentChild {
    return <div>
      <h1>The Hat Game: <a href={`/game/${this.props.roomName}`}>{this.props.roomName}</a></h1>
      <div><Chat roomName={this.props.roomName} userUuid={this.props.userUuid} /></div>
    </div>;
  }
}
