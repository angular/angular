import {by} from 'protractor';
import {locate} from './util';

export function getPage() {
  return by.css('app-status-slider-page');
}

export function getComponent() {
  return by.css('app-status-slider');
}

export function getToggleButton() {
  const toggleButton = () => by.buttonText('Toggle Status');
  return locate(getComponent(), toggleButton());
}

export function getComponentContainer() {
  const findContainer = () => by.css('div');
  return locate(getComponent(), findContainer());
}
