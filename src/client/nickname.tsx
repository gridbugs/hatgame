/** @jsx preactH */
import { h as preactH, Component, ComponentChild, } from 'preact';
import { InputChangeEvent, InputKeyPressEvent } from './event';
import * as api from './api';

export interface Props {
  roomName: string;
  currentValue: string | null;
}

interface State {
  editValue: string;
}

export class NicknameComponent extends Component<Props, State> {
  constructor(props: Props) {
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

  sendInputValue(): void {
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
