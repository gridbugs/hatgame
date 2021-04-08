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
  renderUser(userName: string, isCurrentUser: boolean): ComponentChild {
    if (isCurrentUser) {
      return <span><em>{userName}</em></span>;
    }
    return <span>{userName}</span>;
  }

  render(): ComponentChild {
    return (
      <div>
        <ul>
        {
          this.props.userNamesByUuid
            .filter((_name, userUuid) => this.props.currentUsers.has(userUuid))
            .map((userName, userUuid) => <li key={userUuid}>{
              this.renderUser(userName, userUuid === this.props.currentUserUuid)}</li>).toList().toJS()
        }
        </ul>
      </div>
    );
  }
}
