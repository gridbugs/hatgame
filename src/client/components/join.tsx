/** @jsx preactH */
import {
  h as preactH,
  Component,
  ComponentChild,
} from 'preact';
import { InputChangeEvent, InputKeyPressEvent } from '../input';
import { sendUpdateSocketHttp } from '../update';
import * as u from '../../common/update';

type State = {
  inputValueRoomName: string,
  inputValueYourName: string,
  buttonDisabled: boolean,
};

type Props = {
};

export class JoinComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.setState({
      inputValueRoomName: '',
      inputValueYourName: '',
      buttonDisabled: false,
    });
  }

  inputOnKeyPress(event: InputKeyPressEvent): void {
    if (event.key === 'Enter') {
      this.doJoin();
    }
  }

  updateInputValueRoomName(event: InputChangeEvent): void {
    this.setState({
      inputValueRoomName: event.currentTarget.value,
    });
  }

  updateInputValueYourName(event: InputChangeEvent): void {
    this.setState({
      inputValueYourName: event.currentTarget.value,
    });
  }

  buttonText(): string {
    if (this.state.buttonDisabled) {
      return 'Joining...';
    }
    return 'Join!';
  }

  async doJoin(): Promise<void> {
    this.setState({
      buttonDisabled: true,
    });
    try {
      await sendUpdateSocketHttp({
        room: this.state.inputValueRoomName,
        update: u.mkEnsureUserInRoomWithName({ name: this.state.inputValueYourName }),
      });
      window.location.href = `/game/${this.state.inputValueRoomName}`;
    } catch {
      this.setState({
        buttonDisabled: false,
      });
    }
  }

  render(): ComponentChild {
    return (
      <div>
        <label>Game code:</label>
        <input
          value={this.state.inputValueRoomName}
          onInput={(event: InputChangeEvent) => this.updateInputValueRoomName(event)}
          onKeyPress={(event: InputKeyPressEvent) => this.inputOnKeyPress(event)}
        />
        <label>Your name:</label>
        <input
          value={this.state.inputValueYourName}
          onInput={(event: InputChangeEvent) => this.updateInputValueYourName(event)}
          onKeyPress={(event: InputKeyPressEvent) => this.inputOnKeyPress(event)}
        />
        <input
          type='button'
          disabled={this.state.buttonDisabled}
          value={this.buttonText()} onClick={() => this.doJoin() }>
        </input>
      </div>
    );
  }
}
