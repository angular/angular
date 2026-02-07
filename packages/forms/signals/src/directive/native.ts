/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Renderer2, untracked} from '@angular/core';
import {NativeInputParseError, WithoutFieldTree} from '../api/rules';

/**
 * Supported native control element types.
 *
 * The `type` property of a {@link HTMLTextAreaElement} should always be 'textarea', but the
 * TypeScript DOM API type definition lacks this detail, so we include it here.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/type
 */
export type NativeFormControl =
  | HTMLInputElement
  | HTMLSelectElement
  | (HTMLTextAreaElement & {type: 'textarea'});

export function isNativeFormElement(element: HTMLElement): element is NativeFormControl {
  return (
    element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA'
  );
}

export function isNumericFormElement(element: HTMLElement): boolean {
  if (element.tagName !== 'INPUT') {
    return false;
  }

  const type = (element as HTMLInputElement).type;
  return (
    type === 'date' ||
    type === 'datetime-local' ||
    type === 'month' ||
    type === 'number' ||
    type === 'range' ||
    type === 'time' ||
    type === 'week'
  );
}

export function isTextualFormElement(element: HTMLElement): boolean {
  return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
}

export interface NativeControlValue {
  value?: unknown;
  errors?: readonly WithoutFieldTree<NativeInputParseError>[];
}

/**
 * Returns the value from a native control element.
 *
 * @param element The native control element.
 * @param currentValue A function that returns the current value from the control's corresponding
 *   field state.
 *
 * The type of the returned value depends on the `type` property of the control, and will attempt to
 * match the current value's type. For example, the value of `<input type="number">` can be read as
 * a `string` or a `number`. If the current value is a `number`, then this will return a `number`.
 * Otherwise, this will return the value as a `string`.
 */
export function getNativeControlValue(
  element: NativeFormControl,
  currentValue: () => unknown,
): NativeControlValue {
  if (element.validity.badInput) {
    return {
      errors: [new NativeInputParseError() as WithoutFieldTree<NativeInputParseError>],
    };
  }

  // Special cases for specific input types.
  switch (element.type) {
    case 'checkbox':
      return {value: element.checked};
    case 'number':
    case 'range':
    case 'datetime-local':
      // We can read a `number` or a `string` from this input type. Prefer whichever is consistent
      // with the current type.
      if (typeof untracked(currentValue) === 'number') {
        return {value: element.valueAsNumber};
      }
      break;
    case 'date':
    case 'month':
    case 'time':
    case 'week':
      // We can read a `Date | null`, `number`, or `string` from this input type. Prefer whichever
      // is consistent with the current type.
      const value = untracked(currentValue);
      if (value === null || value instanceof Date) {
        return {value: element.valueAsDate};
      } else if (typeof value === 'number') {
        return {value: element.valueAsNumber};
      }
      break;
  }

  // Default to reading the value as a string.
  return {value: element.value};
}

/**
 * Sets a native control element's value.
 *
 * @param element The native control element.
 * @param value The new value to set.
 */
export function setNativeControlValue(element: NativeFormControl, value: unknown) {
  // Special cases for specific input types.
  switch (element.type) {
    case 'checkbox':
      element.checked = value as boolean;
      return;
    case 'radio':
      // Although HTML behavior is to clear the input already, we do this just in case. It seems
      // like it might be necessary in certain environments (e.g. Domino).
      element.checked = value === element.value;
      return;
    case 'number':
    case 'range':
    case 'datetime-local':
      // This input type can receive a `number` or a `string`.
      if (typeof value === 'number') {
        setNativeNumberControlValue(element, value);
        return;
      }
      break;
    case 'date':
    case 'month':
    case 'time':
    case 'week':
      // This input type can receive a `Date | null` or a `number` or a `string`.
      if (value === null || value instanceof Date) {
        element.valueAsDate = value;
        return;
      } else if (typeof value === 'number') {
        setNativeNumberControlValue(element, value);
        return;
      }
  }

  // Default to setting the value as a string.
  element.value = value as string;
}

/** Writes a value to a native <input type="number">. */
export function setNativeNumberControlValue(element: HTMLInputElement, value: number) {
  // Writing `NaN` causes a warning in the console, so we instead write `''`.
  // This allows the user to safely use `NaN` as a number value that means "clear the input".
  if (isNaN(value)) {
    element.value = '';
  } else {
    element.valueAsNumber = value;
  }
}

/**
 * Updates the native DOM property on the given node.
 *
 * @param key The control binding key (identifies the property type, e.g. disabled, required).
 * @param name The DOM attribute/property name.
 * @param value The new value for the property.
 */
export function setNativeDomProperty(
  renderer: Renderer2,
  element: NativeFormControl,
  name: 'name' | 'disabled' | 'required' | 'readonly' | 'min' | 'max' | 'minLength' | 'maxLength',
  value: string | number | undefined,
) {
  switch (name) {
    case 'name':
      renderer.setAttribute(element, name, value as string);
      break;
    case 'disabled':
    case 'readonly':
    case 'required':
      if (value) {
        renderer.setAttribute(element, name, '');
      } else {
        renderer.removeAttribute(element, name);
      }
      break;
    case 'max':
    case 'min':
    case 'minLength':
    case 'maxLength':
      if (value !== undefined) {
        renderer.setAttribute(element, name, value.toString());
      } else {
        renderer.removeAttribute(element, name);
      }
      break;
  }
}
