import {by} from 'protractor';
import {locate} from './util';

export function getPage() {
  return by.css('app-hero-list-page');
}

export function getComponentContainer() {
  const findContainer = () => by.css('ul');
  return locate(getPage(), findContainer());
}

export function getHeroesList() {
  return getComponentContainer().all(by.css('li'));
}

export function getInput() {
  const input = () => by.css('input');
  return locate(getPage(), input());
}
