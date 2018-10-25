import { by } from 'protractor';
import { locate } from './util';

export function getPage() {
  return by.css('app-open-close-page');
}

export function getComponent() {
  return by.css('app-open-close');
}

export function getToggleButton() {
  const toggleButton = () => by.buttonText('Toggle Open/Close');
  return locate(getComponent(), toggleButton());
}

export function getLoggingCheckbox() {
  const loggingCheckbox = () => by.css('section > input[type="checkbox"]');
  return locate(getPage(), loggingCheckbox());
}

export function getComponentContainer() {
  const findContainer = () => by.css('div');
  return locate(getComponent(), findContainer());
}

export async function getComponentText() {
  const findContainerText = () => by.css('div');
  const contents = locate(getComponent(), findContainerText());
  const componentText = await contents.getText();

  return componentText;
}
