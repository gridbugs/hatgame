/** @jsx preactH */
import { h as preactH, Component, ComponentChild } from 'preact';
import { isSome } from 'fp-ts/lib/Option';
import * as s from '../common/state';

export class Nickname extends Component<{nickname: s.Nickname}> {
  render(): ComponentChild {
    return <span>{this.props.nickname.toString()}</span>;
  }
}

export class Anonymous extends Component<{userUuid: s.UserUuid}> {
  render(): ComponentChild {
    return <span>Anonymous ({this.props.userUuid.toString()})</span>;
  }
}

export class NicknameOfUser extends Component<{user: s.User}> {
  render(): ComponentChild {
    if (isSome(this.props.user.nickname)) {
      return <Nickname nickname={this.props.user.nickname.value}/>;
    }
    return <Anonymous userUuid={this.props.user.userUuid}/>;
  }
}

export class NicknameOfUserPossiblyCurrent extends Component<{
  user: s.User;
  currentUserUuid: s.UserUuid;
}> {
  render(): ComponentChild {
    if (this.props.user.userUuid.eq(this.props.currentUserUuid)) {
      return <strong><em><NicknameOfUser user={this.props.user}/></em></strong>;
    }
    return <strong><NicknameOfUser user={this.props.user}/></strong>;
  }
}
