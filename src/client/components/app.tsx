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

export type ServerConnectionInterfaceConnectCallbacks = {
  onInit: ({ currentUserUuid, model }: {currentUserUuid: m.UserUuid, model: m.Model}) => void,
  onModelUpdate: (model: m.Model) => void,
}

export type ServerConnectionInterface = {
  sendUpdate: (update: u.Update) => Promise<void>,
  connect: (callbacks: ServerConnectionInterfaceConnectCallbacks) => void
};

type Props = {
  serverConnection: ServerConnectionInterface,
};

type State = {
  currentUserUuid: m.UserUuid,
  model: m.Model,
};

export class AppComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.setState({
      model: m.ModelNull,
      currentUserUuid: '',
    });
    this.props.serverConnection.connect({
      onInit: ({ currentUserUuid, model }) => {
        this.setState({ currentUserUuid, model });
      },
      onModelUpdate: (model) => {
        this.setState({ model });
      }
    });
  }

  render(): ComponentChild {
    switch (this.state.model.tag) {
      case 'Null': return <div>reticulating splines...</div>;
      case 'Game': return <GameComponent
        currentUserUuid={this.state.currentUserUuid}
        game={this.state.model.content}
        sendUpdate={this.props.serverConnection.sendUpdate}
      />;
      case 'Lobby': return <LobbyComponent
        currentUserUuid={this.state.currentUserUuid}
        lobby={this.state.model.content}
        sendUpdate={this.props.serverConnection.sendUpdate}
      />;
    }
  }
}
