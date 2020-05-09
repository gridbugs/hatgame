/** @jsx preactH */
import { h as preactH, Component, ComponentChild, } from 'preact';
import { Option } from 'fp-ts/lib/Option';
import { InputChangeEvent, InputKeyPressEvent } from './event';
import * as api from './api';
import { optionalToStringOr } from '../common/string_id';
import { orErrorUnwrap } from '../common/fp';
import * as s from '../common/state';

export interface Props {
  roomName: string;
  nickname: Option<s.Nickname>;
}

interface State {
  editValue: string;
}

export default class SetNickname extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editValue: optionalToStringOr(this.props.nickname, ''),
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
      api.setNickname(this.props.roomName, this.state.editValue).then(orErrorUnwrap);
    }
  }

  render(): ComponentChild {
    return <div><div>nickname: <span style={ { fontWeight: 'bold' } }>
        { optionalToStringOr(this.props.nickname, '(none)') }
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
