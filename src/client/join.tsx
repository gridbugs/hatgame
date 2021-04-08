/** @jsx preactH */
import {
  h as preactH,
  render,
} from 'preact';
import { JoinComponent } from './components/join';

window.onload = () => {
  const container = document.getElementById('container');
  if (container !== null) {
    render(
      <div>
        <h1>Join a Game</h1>
      <JoinComponent />
      </div>,
      container
    );
  }
};

window.onunload = () => {
  // this is here so when navigating back to the join page causes the form to reset
};
