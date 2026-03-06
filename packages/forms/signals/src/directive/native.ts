/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '@angular/core';
import {NativeInputParseError, WithoutFieldTree} from '../api/rules';
import type {ParseResult} from '../api/transformed_value';

// Re-export shared native utilities from main forms package
export {
  isNativeFormElement,
  isNumericFormElement,
  isTextualFormElement,
  setNativeDomProperty,
  type NativeFormControl,
} from '../../../src/directives/native';

import type {NativeFormControl} from '../../../src/directives/native';

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
): ParseResult<unknown> {
  let modelValue: unknown;

  if (element.validity.badInput) {
    return {
      error: new NativeInputParseError() as WithoutFieldTree<NativeInputParseError>,
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
      modelValue = untracked(currentValue);
      if (typeof modelValue === 'number' || modelValue === null) {
        return {value: element.value === '' ? null : element.valueAsNumber};
      }
      break;
    case 'date':
    case 'month':
    case 'time':
    case 'week':
      // We can read a `Date | null`, `number`, or `string` from this input type. Prefer whichever
      // is consistent with the current type.
      modelValue = untracked(currentValue);
      if (modelValue === null || modelValue instanceof Date) {
        return {value: element.valueAsDate};
      } else if (typeof modelValue === 'number') {
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
      } else if (value === null) {
        element.value = '';
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
