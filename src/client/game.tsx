/** @jsx preactH */
import {
  h as preactH,
  render,
  Component,
  ComponentChild,
} from 'preact';
import { PathReporter } from 'io-ts/lib/PathReporter';
import io from 'socket.io-client';
import { isRight } from 'fp-ts/lib/Either';
import * as socketApi from '../common/socket_api';
import { getGameRoomNameFromPathname } from './room_name';
import * as api from './api';
import { orErrorUnwrap } from '../common/fp';
import * as s from '../common/state';
import * as u from '../common/update';
import Lobby from './lobby';
import Play from './play';

window.onload = async () => {
  const container = document.getElementById('container');
  const roomName = getGameRoomNameFromPathname(window.location.pathname);
  if (container !== null) {
    if (roomName === null) {
      render(<p>Unable to read game name!</p>, container);
    } else {
      const { userUuid } = orErrorUnwrap(await api.hello());
      const initialState = orErrorUnwrap(await api.getBaseState(roomName));
      console.log(initialState);
      console.log(userUuid);
      render(<div><App
        roomName={roomName}
        userUuid={userUuid}
        initialState={initialState}/>
      </div>, container);
    }
  }
};

interface Props {
  roomName: string;
  userUuid: s.UserUuid;
  state: s.State;
}

class Game extends Component<Props> {
  render(): ComponentChild {
    switch (this.props.state.phase) {
      case 'Lobby': return <Lobby
        roomName={this.props.roomName}
        userUuid={this.props.userUuid}
        state={this.props.state}
      />;
      case 'Play': return <Play
        roomName={this.props.roomName}
        userUuid={this.props.userUuid}
        state={this.props.state}
      />;
    }
  }
}

interface AppProps {
  roomName: string;
  userUuid: s.UserUuid;
  initialState: s.State;
}

interface AppState {
  roomState: s.State;
}

class App extends Component<AppProps, AppState> {
  private socket: SocketIOClient.Socket;

  constructor(props: AppProps) {
    super(props);
    this.setState({
      roomState: props.initialState,
    });
    this.socket = io(`/${props.roomName}`);
  }

  componentDidMount(): void {
    this.socket.on(socketApi.toString('MessageServerToClient'), (updateEncoded: unknown) => {
      const updateResult = u.UpdateT.decode(updateEncoded);
      if (isRight(updateResult)) {
        const update = updateResult.right;
        this.setState((prevState, _props) => {
          console.log(u.UpdateT.encode(update));
          const roomState = s.applyUpdate(prevState.roomState, update);
          return { roomState };
        });
      } else {
        console.error('failed to decode update', updateEncoded, PathReporter.report(updateResult));
      }
    });
  }

  render(): ComponentChild {
    return <Game
      roomName={this.props.roomName}
      userUuid={this.props.userUuid}
      state={this.state.roomState}/>;
  }
}
