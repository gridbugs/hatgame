// Types representing input fields

/** @jsx preactH */
import {
  h as preactH,
} from 'preact';

export type InputChangeEvent = preactH.JSX.TargetedEvent<HTMLInputElement, Event>;
export type InputKeyPressEvent = preactH.JSX.TargetedEvent<HTMLInputElement, KeyboardEvent>;
