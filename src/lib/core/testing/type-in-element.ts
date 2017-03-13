import {dispatchFakeEvent} from './dispatch-events';

/**
 * Focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param value Value to be set on the input.
 * @param element Element onto which to set the value.
 */
export function typeInElement(value: string, element: HTMLInputElement, autoFocus = true) {
  element.focus();
  element.value = value;
  dispatchFakeEvent(element, 'input');
}
