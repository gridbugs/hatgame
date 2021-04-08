/** @jsx preactH */
import {
  h as preactH,
  Component,
  ComponentChild,
} from 'preact';
import { UserNamesByUuid, CurrentUsers } from '../../common/types';

type Props = {
  currentUserUuid: string,
  userNamesByUuid: UserNamesByUuid,
  currentUsers: CurrentUsers,
};

export class UserListComponent extends Component<Props> {
  renderUser(userUuid: string, userName: string): ComponentChild {
    const comments = [];
    if (userUuid === this.props.currentUserUuid) {
      comments.push('you');
    }
    if (!this.props.currentUsers.has(userUuid)) {
      comments.push('disconnected');
    }
    if (comments.length === 0) {
      return userName;
    }
    const commentsString = comments.map((c) => `(${c})`).join(', ');
    return `${userName} ${commentsString}`;
  }

  render(): ComponentChild {
    return (
      <div>
        <ul>
        {
          this.props.userNamesByUuid
            .map((userName, userUuid) => <li key={userUuid}>{
              this.renderUser(userUuid, userName)}</li>).toList().toJS()
        }
        </ul>
      </div>
    );
  }
}
