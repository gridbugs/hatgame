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
  game: m.Game,
  sendUpdate: (update: u.Update) => Promise<void>,
};

export class GameComponent extends Component<Props> {
  render(): ComponentChild {
    return <div>
      <h1>Game</h1>
      <ChatComponent
        currentUserUuid={this.props.currentUserUuid}
        chat={this.props.game.chat}
        userNamesByUuid={this.props.game.userNamesByUuid}
        sendChatMessage={(text) => this.props.sendUpdate(u.mkAddChatMessage({ text }))}
      />
    </div>;
  }
}
