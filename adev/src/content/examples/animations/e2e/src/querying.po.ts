import { by } from 'protractor';
import { locate } from './util';

export function getComponent() {
  return by.css('app-querying');
}

export function getToggleButton() {
  const toggleButton = () => by.className('toggle');
  return locate(getComponent(), toggleButton());
}

export function getComponentSection() {
  const findSection = () => by.css('section');
  return locate(getComponent(), findSection());
}
