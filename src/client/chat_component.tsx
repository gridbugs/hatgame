/** @jsx preactH */
import { h as preactH, Component, ComponentChild, } from 'preact';
import io from 'socket.io-client';
import {
  map,
  getOrElse,
  Option,
  chain,
  isSome,
} from 'fp-ts/lib/Option';
import { isRight } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as api from './api';
import { InputChangeEvent, InputKeyPressEvent } from './event';
import { NicknameComponent } from './nickname';
import * as socketApi from '../common/socket_api';
import * as s from '../common/state';
import * as u from '../common/update';
import { toString } from '../common/string_id';
import { orErrorUnwrap } from '../common/fp';

interface Props {
  roomName: string;
  userUuid: s.UserUuid;
}

interface State {
  roomState: s.State;
  inputValue: string;
}

function displayMaybeNickname(nickname: Option<s.Nickname>): string {
  return getOrElse(() => 'anonymous')(map(toString)(nickname));
}

export default class Chat extends Component<Props, State> {
  private socket: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.state = {
      roomState: s.EMPTY_STATE,
      inputValue: '',
    };
    this.socket = io(`/${props.roomName}`);
  }

  componentDidMount(): void {
    this.socket.on(socketApi.toString('MessageServerToClient'), (updateEncoded: unknown) => {
      const updateResult = u.UpdateT.decode(updateEncoded);
      if (isRight(updateResult)) {
        const update = updateResult.right;
        this.setState((prevState, _props) => {
          console.log(u.UpdateT.encode(update));
          const roomState = s.applyUpdate(prevState.roomState, update);
          return { roomState };
        });
      } else {
        console.error('failed to decode update', updateEncoded, PathReporter.report(updateResult));
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
      api.message(this.props.roomName, this.state.inputValue).then(orErrorUnwrap);
      this.setState({
        inputValue: '',
      });
    }
  }

  getNicknameForChatDisplay(userUuid: s.UserUuid): string {
    return displayMaybeNickname(s.stateGetNickname(this.state.roomState, userUuid));
  }

  getCurrentNicknameForChatDisplay(): string {
    return this.getNicknameForChatDisplay(this.props.userUuid);
  }

  allUsersSortedByNickname(): readonly s.User[] {
    const users = s.stateAllUsers(this.state.roomState).toJS();
    users.sort((a, b) => {
      if (a.nickname < b.nickname) {
        return -1;
      }
      if (a.nickname > b.nickname) {
        return 1;
      }
      return 0;
    });
    return users;
  }

  hostNickname(): Option<s.Nickname> {
    return pipe(
      this.state.roomState.host,
      chain((host) => s.stateGetNickname(this.state.roomState, host)),
    );
  }

  hostMessage(): ComponentChild {
    if (isSome(this.state.roomState.host)) {
      if (this.state.roomState.host.value.eq(this.props.userUuid)) {
        return <div>You are the host</div>;
      }
      return <div>{displayMaybeNickname(this.hostNickname())} is the host</div>;
    }
    return <div>unknown host</div>;
  }

  render(): ComponentChild {
    return <div>
      { this.hostMessage() }
      <div style= { { display: 'flex' } }>
        <div style={ { height: '20em', width: '60em', overflow: 'scroll' } }>
          <div>
            {
              this.state.roomState.chatMessages.map(
                (message, index) => <div key={index}><span style={ { fontWeight: 'bold' } }> {
                  this.getNicknameForChatDisplay(message.userUuid)
                  }</span>: {message.messageText.toString()}</div>
              ).toJS()
            }
          </div>
        </div>
        <div style={ { height: '20em', width: '40em' } }>
          {
            this.allUsersSortedByNickname().map(
              ({ userUuid, nickname }, index) => <div key={index}>
                { displayMaybeNickname(nickname) } { userUuid.eq(this.props.userUuid) ? '(you)' : '' } ({ userUuid.toString() })
              </div>
            )
          }
        </div>
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
      currentValue={this.getCurrentNicknameForChatDisplay()}
      roomName={this.props.roomName}/>
    </div>;
  }
}
