import {by} from 'protractor';
import {locate} from './util';

export function getPage() {
  return by.css('app-toggle-animations-child-page');
}

export function getComponent() {
  return by.css('app-open-close-toggle');
}

export function getToggleButton() {
  const toggleButton = () => by.buttonText('Toggle Open/Closed');
  return locate(getComponent(), toggleButton());
}

export function getToggleAnimationsButton() {
  const toggleAnimationsButton = () => by.buttonText('Toggle Animations');
  return locate(getComponent(), toggleAnimationsButton());
}

export function getComponentContainer() {
  const findContainer = () => by.css('div');
  return locate(getComponent()).all(findContainer()).get(0);
}
