/** @jsx preactH */
import { h as preactH, Component, ComponentChild } from 'preact';

interface State {
  messages: string[];
}

export default class Chat extends Component<{}, State> {
  constructor() {
    super();
    this.state = { messages: [] };
  }

  public render(): ComponentChild {
    return <div>
    {
      this.state.messages.map((message, index) => <div key={index}>{message}</div>)
    }
    </div>;
  }
}
