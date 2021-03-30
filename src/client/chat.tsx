/** @jsx preactH */
import {
  h as preactH,
  Component,
  ComponentChild,
} from 'preact';
import * as t from 'io-ts';
import { either as mkEitherT } from 'io-ts-types/lib/either';
import { either } from 'fp-ts';
import * as s from '../common/state';
import * as m from '../common/message';
import * as e from '../common/error';

type InputChangeEvent = preactH.JSX.TargetedEvent<HTMLInputElement, Event>;
type InputKeyPressEvent = preactH.JSX.TargetedEvent<HTMLInputElement, KeyboardEvent>;

class ChatMessage extends Component<{ userUuid: string, userName: string, text: string, currentUser: boolean }> {
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
  chat: s.Chat,
  usersByUuid: s.UsersByUuid,
};

export async function sendMessage(message: m.Message): Promise<t.Validation<either.Either<e.Error, 'ok'>>> {
  const messageEncoded = m.encodeMessageForRoom('foo', message);
  const messageEscaped = encodeURIComponent(JSON.stringify(messageEncoded));
  const result = await (await fetch(`/message/${messageEscaped}`)).json();
  return mkEitherT(e.ErrorT, t.literal('ok')).decode(result);
}

export class Chat extends Component<Props, State> {
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
      await sendMessage(m.mkAddChatMessage({ text: this.state.inputValue }));
      this.setState({
        inputValue: '',
      });
    }
  }

  render(): ComponentChild {
    return <div>
      {
        this.props.chat.map((message, key) => {
          const maybeUser = this.props.usersByUuid.get(message.userUuid);
          const userName = maybeUser === undefined ? 'unknown' : maybeUser.name;
          return <ChatMessage
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
