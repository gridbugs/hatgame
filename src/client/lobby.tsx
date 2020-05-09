/** @jsx preactH */
import { h as preactH, Component, ComponentChild } from 'preact';
import { orErrorUnwrap } from '../common/fp';
import * as s from '../common/state';
import WhoIsHost from './who_is_host';
import SetNickname from './set_nickname';
import UserList from './user_list';
import Chat from './chat';
import * as api from './api';

interface Props {
  roomName: string;
  userUuid: s.UserUuid;
  state: s.State;
}

export default class Lobby extends Component<Props> {
  currentUser(): s.User {
    return s.getUser(this.props.state, this.props.userUuid);
  }

  currentUserIsHost(): boolean {
    return this.props.state.host.eq(this.props.userUuid);
  }

  render(): ComponentChild {
    return <div>
      <h1>The Hat Game: <a href={`/game/${this.props.roomName}`}>{this.props.roomName}</a></h1>
      <WhoIsHost userUuid={this.props.userUuid} state={this.props.state}/>
      <SetNickname roomName={this.props.roomName} nickname={this.currentUser().nickname}/>
      <h2>Chat</h2>
      <Chat
        roomName={this.props.roomName}
        userUuid={this.props.userUuid}
        state={this.props.state}
        dimensions={ {
          width: '40em',
          height: '20em',
        } }
      />
      <div style={ { 'padding-top': '2em' } }>
      { this.currentUserIsHost()
        ? <input
        type='button'
        value='Start Game!'
        onClick={() => api.startGame(this.props.roomName).then(orErrorUnwrap)}
      />
        : <div>Wait for host to start the game</div>
      }
    </div>
      <h2>Players ({this.props.state.users.size} total)</h2>
      <UserList userUuid={this.props.userUuid} state={this.props.state}/>
    </div>;
  }
}
