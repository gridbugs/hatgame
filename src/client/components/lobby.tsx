/** @jsx preactH */
import {
  h as preactH,
  Component,
  ComponentChild,
} from 'preact';
import { ChatComponent } from '../components/chat';
import { UserListComponent } from '../components/user_list';
import { SubmitWordsComponent } from '../components/submit_words';
import * as m from '../../common/model';
import * as u from '../../common/update';

type Props = {
  currentUserUuid: string,
  lobby: m.Lobby,
  sendUpdate: (update: u.Update) => Promise<void>,
};

export class LobbyComponent extends Component<Props> {
  render(): ComponentChild {
    return <div>
      <h1>Lobby</h1>
      <h2>Users</h2>
      <UserListComponent
        currentUserUuid={this.props.currentUserUuid}
        userNamesByUuid={this.props.lobby.userNamesByUuid}
        currentUsers={this.props.lobby.currentUsers}
        numSubmittedWordsByUserUuid={this.props.lobby.numSubmittedWordsByUserUuid}
      />
      <h2>Chat</h2>
      <ChatComponent
        currentUserUuid={this.props.currentUserUuid}
        chat={this.props.lobby.chat}
        userNamesByUuid={this.props.lobby.userNamesByUuid}
        sendChatMessage={(text) => this.props.sendUpdate(u.mkAddChatMessage({ text }))}
      />
      <h2>Submit Words</h2>
      <SubmitWordsComponent
        numWords={3}
        submittedWords={this.props.lobby.submittedWords}
        sendUpdate={this.props.sendUpdate}
      />

    </div>;
  }
}
