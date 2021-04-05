/** @jsx preactH */
import {
  h as preactH,
  Component,
  ComponentChild,
} from 'preact';
import { ChatComponent } from '../components/chat';
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
      <ChatComponent
        currentUserUuid={this.props.currentUserUuid}
        chat={this.props.lobby.chat}
        userNamesByUuid={this.props.lobby.userNamesByUuid}
        sendChatMessage={(text) => this.props.sendUpdate(u.mkAddChatMessage({ text }))}
      />
    </div>;
  }
}
