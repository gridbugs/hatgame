/** @jsx preactH */
import { h as preactH, Component, ComponentChild } from 'preact';
import * as s from '../common/state';
import { NicknameOfUser } from './nickname';

interface Props {
  userUuid: s.UserUuid;
  playingState: s.Playing;
  state: s.State;
}

export default class GameArea extends Component<Props> {
  currentTurnUser(): s.User {
    return s.getCurrentTurnUser(this.props.state, this.props.playingState);
  }

  render(): ComponentChild {
    const currentTurnUser = this.currentTurnUser();
    return <div>
      <span>Current turn:&nbsp;
        <NicknameOfUser
          user={currentTurnUser}
        />
        { currentTurnUser.userUuid.eq(this.props.userUuid) ? " (you) " : "" }
      </span>
    </div>;
  }
}
