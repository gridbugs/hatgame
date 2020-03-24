/** @jsx preactH */
import { h as preactH, Component, ComponentChild, } from 'preact';
import {
  State as RoomState,
  EMPTY_STATE,
  isUpdate,
  updateState,
} from '../common/state';

interface Props {
  socket: SocketIOClient.Socket;
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
  constructor(props: Props) {
    super(props);
    this.state = {
      roomState: EMPTY_STATE,
      inputValue: '',
    };
  }

  componentDidMount(): void {
    this.props.socket.on('messageServerToClient', (update: any) => {
      console.log(update);
      if (isUpdate(update)) {
        this.setState({
          roomState: updateState(this.state.roomState, update),
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

  sendInputValue(): void {
    if (this.state.inputValue !== '') {
      this.props.socket.emit('messageClientToServer', this.state.inputValue);
      this.setState({
        inputValue: '',
      });
    }
  }

  render(): ComponentChild {
    return <div>
      <h1>{nspToheading(this.props.socket.nsp)}</h1>
      <div>
        {
          this.state.roomState.chatMessages.map(
            (message, index) => <div key={index}>{message.userUuid}: {message.messageText}</div>
          ).toJS()
        }
      </div>
      <input
        value={this.state.inputValue}
        onInput={(event: InputChangeEvent) => this.updateInputValue(event)}
        onKeyPress={(event: InputKeyPressEvent) => this.inputOnKeyPress(event)}
      >
      </input>
      <input type='button' value='Send!' onClick={() => this.sendInputValue()}></input>
    </div>;
  }
}
