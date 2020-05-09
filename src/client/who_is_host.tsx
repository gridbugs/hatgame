/** @jsx preactH */
import { h as preactH, Component, ComponentChild, } from 'preact';
import { NicknameOfUser } from './nickname';
import * as s from '../common/state';

class YouAreTheHost extends Component<{user: s.User}> {
  render(): ComponentChild {
    return <span>You (<NicknameOfUser user={this.props.user}/>) are the host.</span>;
  }
}

class UserIsTheHost extends Component<{user: s.User}> {
  render(): ComponentChild {
    return <span><NicknameOfUser user={this.props.user}/> is the host.</span>;
  }
}

interface Props {
  userUuid: s.UserUuid;
  state: s.State;
}

export default class WhoIsHost extends Component<Props> {
  render(): ComponentChild {
    const host = s.getHostUser(this.props.state);
    if (host.userUuid.eq(this.props.userUuid)) {
      return <YouAreTheHost user={host}/>;
    }
    return <UserIsTheHost user={host}/>;
  }
}
