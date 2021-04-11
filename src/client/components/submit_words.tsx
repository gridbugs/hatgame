/** @jsx preactH */
import {
  h as preactH,
  Component,
  ComponentChild,
} from 'preact';
import * as i from 'immutable';
import * as u from '../../common/update';
import * as m from '../../common/model';
import { InputChangeEvent, InputKeyPressEvent } from '../input';

type State = {
  words: i.List<string>,
  waiting: boolean,
};

type Props = {
  numWords: number,
  submittedWords: m.WordList,
  sendUpdate: (update: u.Update) => Promise<void>,
};

export class SubmitWordsComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const array = Array(props.numWords);
    for (let idx = 0; idx < array.length; idx += 1) {
      array[idx] = props.submittedWords.get(idx, '');
    }
    this.setState({
      words: i.List(array),
      waiting: false,
    });
  }

  async sendInputValue(): Promise<void> {
    this.setState({ waiting: true });
    await this.props.sendUpdate(u.mkSetWords({
      words: this.state.words.filter((w) => w !== ''),
    }));
    this.setState({ waiting: false });
  }

  inputOnKeyPress(event: InputKeyPressEvent): void {
    if (event.key === 'Enter') {
      this.sendInputValue();
    }
  }

  updateInputValue(index: number, event: InputChangeEvent): void {
    this.setState({
      words: this.state.words.set(index, event.currentTarget.value),
    });
  }

  buttonText(): string {
    if (this.state.waiting) {
      return 'Submitting...';
    }
    return 'Submit!';
  }

  render(): ComponentChild {
    return (
      <div>
        <ul>
          {
            this.state.words.map((word, key) => (
                <li key={key}>
                  <input
                    value={word}
                    onInput={(event: InputChangeEvent) => this.updateInputValue(key, event)}
                    onKeyPress={(event: InputKeyPressEvent) => this.inputOnKeyPress(event)}
                  />
                </li>
            )).toJS()
          }
        </ul>
        <input
          type='button'
          value={this.buttonText()}
          disabled={this.state.waiting}
          onClick={() => this.sendInputValue()}
        />
      </div>
    );
  }
}
