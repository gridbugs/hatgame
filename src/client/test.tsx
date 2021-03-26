/** @jsx preactH */
import {
  h as preactH,
  render,
} from 'preact';

window.onload = async () => {
  const container = document.getElementById('container');
  if (container !== null) {
    render(
      <h2>hi</h2>,
      container
    );
  }
};
