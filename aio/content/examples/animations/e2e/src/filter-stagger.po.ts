import { by } from 'protractor';
import { locate } from './util';

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

export function getFormInput() {
  const formInput = () => by.css('form > input');
  return locate(getPage(), formInput());
}
