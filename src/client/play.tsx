/** @jsx preactH */
import { h as preactH, Component, ComponentChild } from 'preact';
import * as s from '../common/state';
import WhoIsHost from './who_is_host';
import UserList from './user_list';
import Chat from './chat';

interface Props {
  roomName: string;
  userUuid: s.UserUuid;
  state: s.State;
}

export default class Play extends Component<Props> {
  currentUser(): s.User {
    return s.getUser(this.props.state, this.props.userUuid);
  }

  render(): ComponentChild {
    return <div>
      <h1>The Hat Game: <a href={`/game/${this.props.roomName}`}>{this.props.roomName}</a></h1>
      <div style={ { display: 'flex' } }>
        <div style={ { width: '200em' } }>
          game area placeholder
        </div>
        <div>
          <WhoIsHost userUuid={this.props.userUuid} state={this.props.state}/>
          <h2>Players</h2>
          <UserList userUuid={this.props.userUuid} state={this.props.state}/>
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
        </div>
      </div>
    </div>;
  }
}
