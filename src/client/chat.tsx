/** @jsx preactH */
import { h as preactH, Component, ComponentChild, } from 'preact';
import io from 'socket.io-client';
import {
  State as RoomState,
  EMPTY_STATE,
  isUpdate,
  updateState,
  Nickname,
} from '../common/state';
import * as api from './api';
import { UserUuid } from '../common/user_uuid';

interface NicknameProps {
  roomName: string;
  currentValue: string | null;
}

interface NicknameState {
  editValue: string;
}

class NicknameComponent extends Component<NicknameProps, NicknameState> {
  constructor(props: NicknameProps) {
    super(props);
    this.state = {
      editValue: props.currentValue === null ? '' : props.currentValue,
    };
  }

  inputOnKeyPress(event: InputKeyPressEvent): void {
    if (event.key === 'Enter') {
      this.sendInputValue();
    }
  }

  updateInputValue(event: InputChangeEvent): void {
    this.setState({
      editValue: event.currentTarget.value,
    });
  }

  async sendInputValue(): Promise<void> {
    if (this.state.editValue !== '') {
      api.setNickname(this.props.roomName, this.state.editValue);
    }
  }

  render(): ComponentChild {
    return <div><div>nickname: <span style={ { fontWeight: 'bold' } }>
        { this.props.currentValue === null ? '(none)' : this.props.currentValue }
      </span></div>
      <div>
      <input
        value={this.state.editValue}
        onInput={(event: InputChangeEvent) => this.updateInputValue(event)}
        onKeyPress={(event: InputKeyPressEvent) => this.inputOnKeyPress(event)}
      >
      </input>
      <input type='button' value='Change Nickname!' onClick={() => this.sendInputValue()}></input>
  </div></div>;
  }
}

interface Props {
  roomName: string;
  userUuid: UserUuid;
}

interface State {
  roomState: RoomState;
  inputValue: string;
}

function nspToheading(nsp: string): string {
  return nsp.replace(/^\//, '');
}

type InputChangeEvent = preactH.JSX.TargetedEvent<HTMLInputElement, Event>;
type InputKeyPressEvent = preactH.JSX.TargetedEvent<HTMLInputElement, KeyboardEvent>;

export default class Chat extends Component<Props, State> {
  private socket: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.state = {
      roomState: EMPTY_STATE,
      inputValue: '',
    };
    this.socket = io(`/${props.roomName}`);
  }

  async componentDidMount(): Promise<void> {
    this.socket.on('messageServerToClient', (update: any) => {
      console.log(update);
      if (isUpdate(update)) {
        const roomState = updateState(this.state.roomState, update);
        this.setState({
          roomState,
        });
      }
    });
  }

  inputOnKeyPress(event: InputKeyPressEvent): void {
    if (event.key === 'Enter') {
      this.sendInputValue();
    }
  }

  updateInputValue(event: InputChangeEvent): void {
    this.setState({
      inputValue: event.currentTarget.value,
    });
  }

  async sendInputValue(): Promise<void> {
    if (this.state.inputValue !== '') {
      api.message(this.props.roomName, this.state.inputValue);
      this.setState({
        inputValue: '',
      });
    }
  }

  currentNickname(): Nickname | null {
    return this.state.roomState.userNicknames.get(this.props.userUuid, null);
  }

  getNicknameOr(userUuid: UserUuid, defaultNickname: Nickname): Nickname {
    return this.state.roomState.userNicknames.get(userUuid, defaultNickname);
  }

  getNicknameForChatdisplay(userUuid: UserUuid): Nickname {
    return this.getNicknameOr(userUuid, 'anonymous');
  }

  render(): ComponentChild {
    return <div>
      <h1>{nspToheading(this.socket.nsp)}</h1>
      <div>
        {
          this.state.roomState.chatMessages.map(
            (message, index) => <div key={index}><span style={ { fontWeight: 'bold' } }> {
              this.getNicknameForChatdisplay(message.userUuid)
              }</span>: {message.messageText}</div>
          ).toJS()
        }
      </div>
      <div>
      <input
        value={this.state.inputValue}
        onInput={(event: InputChangeEvent) => this.updateInputValue(event)}
        onKeyPress={(event: InputKeyPressEvent) => this.inputOnKeyPress(event)}
      >
      </input>
      <input type='button' value='Send!' onClick={() => this.sendInputValue()}></input>
    </div>
    <NicknameComponent
      currentValue={this.currentNickname()}
      roomName={this.props.roomName}/>
    </div>;
  }
}
