import { by } from 'protractor';
import { locate } from './util';

export function getPage() {
  return by.css('app-hero-list-enter-leave-page');
}

export function getComponent() {
  return by.css('app-hero-list-enter-leave');
}

export function getComponentContainer() {
  const findContainer = () => by.css('ul');
  return locate(getComponent(), findContainer());
}

export function getHeroesList() {
  return getComponentContainer().all(by.css('li'));
}
