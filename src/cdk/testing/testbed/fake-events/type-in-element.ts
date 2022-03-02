/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getNoKeysSpecifiedError, ModifierKeys} from '@angular/cdk/testing';
import {PERIOD} from '@angular/cdk/keycodes';
import {dispatchFakeEvent, dispatchKeyboardEvent} from './dispatch-events';
import {triggerFocus} from './element-focus';

/** Input types for which the value can be entered incrementally. */
const incrementalInputTypes = new Set([
  'text',
  'email',
  'hidden',
  'password',
  'search',
  'tel',
  'url',
]);

/**
 * Checks whether the given Element is a text input element.
 * @docs-private
 */
export function isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  const nodeName = element.nodeName.toLowerCase();
  return nodeName === 'input' || nodeName === 'textarea';
}

/**
 * If keys have been specified, focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(
  element: HTMLElement,
  ...keys: (string | {keyCode?: number; key?: string})[]
): void;

/**
 * If keys have been specified, focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param modifiers Modifier keys that are held while typing.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(
  element: HTMLElement,
  modifiers: ModifierKeys,
  ...keys: (string | {keyCode?: number; key?: string})[]
): void;

export function typeInElement(element: HTMLElement, ...modifiersAndKeys: any[]) {
  const first = modifiersAndKeys[0];
  let modifiers: ModifierKeys;
  let rest: (string | {keyCode?: number; key?: string})[];
  if (
    first !== undefined &&
    typeof first !== 'string' &&
    first.keyCode === undefined &&
    first.key === undefined
  ) {
    modifiers = first;
    rest = modifiersAndKeys.slice(1);
  } else {
    modifiers = {};
    rest = modifiersAndKeys;
  }
  const isInput = isTextInput(element);
  const inputType = element.getAttribute('type') || 'text';
  const keys: {keyCode?: number; key?: string}[] = rest
    .map(k =>
      typeof k === 'string'
        ? k.split('').map(c => ({keyCode: c.toUpperCase().charCodeAt(0), key: c}))
        : [k],
    )
    .reduce((arr, k) => arr.concat(k), []);

  // Throw an error if no keys have been specified. Calling this function with no
  // keys should not result in a focus event being dispatched unexpectedly.
  if (keys.length === 0) {
    throw getNoKeysSpecifiedError();
  }

  // We simulate the user typing in a value by incrementally assigning the value below. The problem
  // is that for some input types, the browser won't allow for an invalid value to be set via the
  // `value` property which will always be the case when going character-by-character. If we detect
  // such an input, we have to set the value all at once or listeners to the `input` event (e.g.
  // the `ReactiveFormsModule` uses such an approach) won't receive the correct value.
  const enterValueIncrementally =
    inputType === 'number'
      ? // The value can be set character by character in number inputs if it doesn't have any decimals.
        keys.every(key => key.key !== '.' && key.keyCode !== PERIOD)
      : incrementalInputTypes.has(inputType);

  triggerFocus(element);

  // When we aren't entering the value incrementally, assign it all at once ahead
  // of time so that any listeners to the key events below will have access to it.
  if (!enterValueIncrementally) {
    (element as HTMLInputElement).value = keys.reduce((value, key) => value + (key.key || ''), '');
  }

  for (const key of keys) {
    dispatchKeyboardEvent(element, 'keydown', key.keyCode, key.key, modifiers);
    dispatchKeyboardEvent(element, 'keypress', key.keyCode, key.key, modifiers);
    if (isInput && key.key && key.key.length === 1) {
      if (enterValueIncrementally) {
        (element as HTMLInputElement | HTMLTextAreaElement).value += key.key;
        dispatchFakeEvent(element, 'input');
      }
    }
    dispatchKeyboardEvent(element, 'keyup', key.keyCode, key.key, modifiers);
  }

  // Since we weren't dispatching `input` events while sending the keys, we have to do it now.
  if (!enterValueIncrementally) {
    dispatchFakeEvent(element, 'input');
  }
}

/**
 * Clears the text in an input or textarea element.
 * @docs-private
 */
export function clearElement(element: HTMLInputElement | HTMLTextAreaElement) {
  triggerFocus(element as HTMLElement);
  element.value = '';
  dispatchFakeEvent(element, 'input');
}
