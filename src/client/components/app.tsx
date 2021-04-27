/** @jsx preactH */
import {
  h as preactH,
  ComponentChild,
  Component,
} from 'preact';
import { option } from 'fp-ts';
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
  error: option.Option<string>,

};

export class AppComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.setState({
      model: m.ModelNull,
      currentUserUuid: '',
      error: option.none,
    });
    this.props.serverConnection.connect({
      onInit: ({ currentUserUuid, model }) => {
        this.setState({ currentUserUuid, model });
      },
      onModelUpdate: (model) => {
        if (this.state.model.tag !== model.tag) {
          this.setState({
            error: option.none,
          });
        }
        this.setState({ model });
      }
    });
  }

  renderLoading(): ComponentChild {
    return <div>reticulating splines...</div>;
  }

  async sendUpdate(update: u.Update): Promise<void> {
    try {
      await this.props.serverConnection.sendUpdate(update);
      this.setState({
        error: option.none,
      });
    } catch (e: any) {
      if (e instanceof Error) {
        this.setState({
          error: option.some(e.message),
        });
      }
    }
  }

  renderMain(): ComponentChild {
    if (this.state.currentUserUuid === '') {
      return this.renderLoading();
    }
    switch (this.state.model.tag) {
      case 'Null': return this.renderLoading();
      case 'Game': return <GameComponent
        currentUserUuid={this.state.currentUserUuid}
        game={this.state.model.content}
        sendUpdate={(update) => this.sendUpdate(update)}
      />;
      case 'Lobby': return <LobbyComponent
        currentUserUuid={this.state.currentUserUuid}
        lobby={this.state.model.content}
        sendUpdate={(update) => this.sendUpdate(update)}
      />;
    }
  }

  renderError(): ComponentChild {
    if (option.isSome(this.state.error)) {
      return <div>{this.state.error.value}</div>;
    }
    return <div></div>;
  }

  render(): ComponentChild {
    return <div>
      {this.renderError()}
      {this.renderMain()}
    </div>;
  }
}
