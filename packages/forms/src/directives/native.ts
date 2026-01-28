/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Renderer2} from '@angular/core';

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

/**
 * Updates the native DOM property on the given node.
 *
 * @param renderer The renderer to use for DOM operations.
 * @param element The native form control element.
 * @param name The DOM attribute/property name.
 * @param value The new value for the property.
 */
export function setNativeDomProperty(
  renderer: Renderer2,
  element: NativeFormControl,
  name: 'name' | 'disabled' | 'required' | 'readonly' | 'min' | 'max' | 'minLength' | 'maxLength',
  value: string | number | boolean | undefined,
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
