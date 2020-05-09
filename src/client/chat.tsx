/** @jsx preactH */
import { h as preactH, Component, ComponentChild } from 'preact';
import * as s from '../common/state';
import { orErrorUnwrap } from '../common/fp';
import { InputChangeEvent, InputKeyPressEvent } from './event';
import * as api from './api';
import { NicknameOfUserPossiblyCurrent } from './nickname';

class ChatMessage extends Component<{
  user: s.User;
  messageText: s.MessageText;
  currentUserUuid: s.UserUuid;
}> {
  render(): ComponentChild {
    return <div>
      <span>
        <NicknameOfUserPossiblyCurrent
          user={this.props.user}
          currentUserUuid={this.props.currentUserUuid}
        />:&nbsp;
      </span>
      <span>{this.props.messageText.toString()}</span>
    </div>;
  }
}

interface Dimensions {
  width: string;
  height: string;
}

interface Props {
  roomName: string;
  userUuid: s.UserUuid;
  state: s.State;
  dimensions: Dimensions;
}

interface State {
  inputValue: string;
}

export default class Chat extends Component<Props, State> {
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

  sendInputValue(): void {
    if (this.state.inputValue !== '') {
      api.message(this.props.roomName, this.state.inputValue).then(orErrorUnwrap);
      this.setState({
        inputValue: '',
      });
    }
  }

  render(): ComponentChild {
    return <div>
      <div style={ {
        ...this.props.dimensions,
        overflow: 'scroll',
      } } >
      <ul style={ {
        'list-style-type': 'none',
        margin: '0px',
        padding: '0px',
      } }>
          {
            this.props.state.chatMessages.map(
              ({ userUuid, messageText }, index) => <li key={index}>
                <ChatMessage
                  user={s.getUser(this.props.state, userUuid)}
                  messageText={messageText}
                  currentUserUuid={this.props.userUuid}
                />
              </li>
            ).toJS()
          }
        </ul>
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
    </div>;
  }
}
