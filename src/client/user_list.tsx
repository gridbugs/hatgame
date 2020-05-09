/** @jsx preactH */
import { h as preactH, Component, ComponentChild } from 'preact';
import * as s from '../common/state';
import { NicknameOfUserPossiblyCurrent } from './nickname';

class UserListItem extends Component<{user: s.User; currentUserUuid: s.UserUuid}> {
  render(): ComponentChild {
    return <NicknameOfUserPossiblyCurrent
      user={this.props.user}
      currentUserUuid={this.props.currentUserUuid}
    />;
  }
}

interface Props {
  userUuid: s.UserUuid;
  state: s.State;
}

export default class UserList extends Component<Props> {
  allUsersSortedByNickname(): readonly s.User[] {
    const users = s.allUsers(this.props.state).toJS();
    users.sort((a, b) => {
      if (a.nickname < b.nickname) {
        return -1;
      }
      if (a.nickname > b.nickname) {
        return 1;
      }
      return 0;
    });
    return users;
  }

  render(): ComponentChild {
    return <ul>
        {
            this.allUsersSortedByNickname().map(
              (user, index) => <li key={index}>
                <UserListItem
                  user={user}
                  currentUserUuid={this.props.userUuid}
                />
              </li>
            )
          }

    </ul>;
  }
}
