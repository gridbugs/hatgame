/** @jsx preactH */
import {
  h as preactH,
  ComponentChild,
  Component,
  render,
} from 'preact';
import io from 'socket.io-client';
import { Provider } from 'react-redux';
import { createStore, Action } from 'redux';
import { either } from 'fp-ts';
import * as i from 'immutable';
import { Chat, sendMessage } from './chat';
import * as mo from '../common/model';
import * as m from '../common/message';

type AppAction = string;
type AppState = string;

function rootReducer(_state: AppState | undefined, _action: Action<AppAction>): AppState {
  return 'foo';
}

const store = createStore(rootReducer);

type Props = {
  currentUserUuid: string,
};

type State = {
  lobby: mo.Lobby,
};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.setState({
      lobby: {
        usersByUuid: i.Map(),
        chat: i.List(),
      },
    });
    const socket = io('/foo');
    socket.on('connect', () => {
      console.log(socket.id);
    });
    socket.on('update', (lobbyEncoded: any) => {
      const lobbyEither = mo.LobbyT.decode(lobbyEncoded);
      if (either.isRight(lobbyEither)) {
        const lobby = lobbyEither.right;
        console.log(lobby);
        this.setState({ lobby });
      }
    });
  }

  render(): ComponentChild {
    return <Chat
      currentUserUuid={this.props.currentUserUuid}
      chat={this.state.lobby.chat}
      usersByUuid={this.state.lobby.usersByUuid}
    />;
  }
}

window.onload = async () => {
  const currentUserUuid = await (await fetch('/query/current-user-uuid')).text();
  const container = document.getElementById('container');
  if (container !== null) {
    const socket = io('/foo');
    socket.on('connect', () => {
      console.log(socket.id);
    });
    socket.on('update', (state: any) => {
      console.log(state);
    });
    console.log(await sendMessage(m.mkEnsureUserInRoomWithName({
      name: `steve${Math.floor(Math.random() * 1000)}`,
    })));
    render(
      <Provider store={store}>
        <div>
          <App currentUserUuid={currentUserUuid} />
        </div>
      </Provider>,
      container
    );
  }
};
