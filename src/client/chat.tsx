/** @jsx preactH */
import { h as preactH, Component, ComponentChild, } from 'preact';
import { Message, isMessage } from '../common/message';
import { State as _ } from '../common/state';

interface Props {
  socket: SocketIOClient.Socket;
}

interface State {
  messages: Message[];
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
      messages: [],
      inputValue: '',
    };
  }

  componentDidMount(): void {
    this.props.socket.on('message', (message: any) => {
      if (isMessage(message)) {
        this.setState({
          messages: [...this.state.messages, message],
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
      this.props.socket.emit('message', this.state.inputValue);
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
          this.state.messages.map(
            (message, index) => <div key={index}>{message.userUuid}: {message.text}</div>
          )
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
