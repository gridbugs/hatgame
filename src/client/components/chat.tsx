/** @jsx preactH */
import {
  h as preactH,
  Component,
  ComponentChild,
} from 'preact';
import { Chat, UserNamesByUuid } from '../../common/types';
import { InputChangeEvent, InputKeyPressEvent } from '../input';

class ChatMessageComponent extends Component<
  { userUuid: string, userName: string, text: string, currentUser: boolean }
> {
  renderName(): ComponentChild {
    if (this.props.currentUser) {
      return <strong><em>{this.props.userName}</em></strong>;
    }
    return <strong>{this.props.userName}</strong>;
  }

  render(): ComponentChild {
    return <div>
      <span>
        {this.renderName()}
      </span>:&nbsp;
      <span>
        {this.props.text}
      </span>
    </div>;
  }
}

type State = {
  inputValue: string,
};

type Props = {
  currentUserUuid: string,
  chat: Chat,
  userNamesByUuid: UserNamesByUuid,
  sendChatMessage: (text: string) => Promise<void>,
};

export class ChatComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.setState({
      inputValue: '',
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
      await this.props.sendChatMessage(this.state.inputValue);
      this.setState({
        inputValue: '',
      });
    }
  }

  render(): ComponentChild {
    return <div>
      {
        this.props.chat.map((message, key) => {
          const maybeUserName = this.props.userNamesByUuid.get(message.userUuid);
          const userName = maybeUserName === undefined ? 'unknown' : maybeUserName;
          return <ChatMessageComponent
            key={key}
            userUuid={message.userUuid}
            userName={userName}
            text={message.text}
            currentUser={this.props.currentUserUuid === message.userUuid}
          />;
        }).toJS()
      }
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
