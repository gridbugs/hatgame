/** @jsx preactH */
import {
  h as preactH,
  ComponentChild,
  Component,
} from 'preact';
import { LobbyComponent } from '../components/lobby';
import { GameComponent } from '../components/game';
import * as m from '../../common/model';
import * as u from '../../common/update';

type ServerConnectionInterface = {
  sendUpdate: (update: u.Update) => Promise<void>,
  connect: (onModelUpdate: (model: m.Model) => void) => void,
};

type Props = {
  currentUserUuid: string,
  serverConnection: ServerConnectionInterface,
};

type State = {
  model: m.Model,
};

export class AppComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.setState({
      model: m.ModelNull,
    });
    this.props.serverConnection.connect((model) => {
      this.setState({ model });
    });
  }

  render(): ComponentChild {
    switch (this.state.model.tag) {
      case 'Null': return <div>reticulating splines...</div>;
      case 'Game': return <GameComponent
        currentUserUuid={this.props.currentUserUuid}
        game={this.state.model.content}
        sendUpdate={this.props.serverConnection.sendUpdate}
      />;
      case 'Lobby': return <LobbyComponent
        currentUserUuid={this.props.currentUserUuid}
        lobby={this.state.model.content}
        sendUpdate={this.props.serverConnection.sendUpdate}
      />;
    }
  }
}
