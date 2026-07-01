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
  | (HTMLTextAreaElement & {type: 'textarea'})
  | FormAssociatedCustomElement;

/**
 * Custom elements can be form associated via using the `ElementInternals` API.
 * Properties are not guaranteed to be present on the element, but are included here for type safety.
 * Adherence to the form element API convention is the responsibility of the custom element author.
 *
 * See also:
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals#examples
 */
export interface FormAssociatedCustomElement extends HTMLElement {
  type?: string;
  checked?: boolean;
  value?: string;
  valueAsNumber?: number;
  valueAsDate?: Date;
  disabled?: boolean;
  readonly validity?: ValidityState;
  readonly validationMessage?: string;
}

export function isNativeFormElement(element: HTMLElement): element is NativeFormControl {
  return (
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA' ||
    isFormAssociatedCustomElement(element)
  );
}

export function elementAcceptsMinMax(element: HTMLElement): boolean {
  if (element.tagName === 'INPUT') {
    const type = (element as HTMLInputElement).type;
    return type === 'number' || type === 'range' || type === 'date' || type === 'month';
  }

  const {formAssociated, observedAttributes} = getCustomElementClass(element) ?? {};
  return !!(
    formAssociated &&
    observedAttributes?.includes('min') &&
    observedAttributes?.includes('max')
  );
}

export function elementAcceptsMinMaxLength(element: HTMLElement): boolean {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    return true;
  }

  const {formAssociated, observedAttributes} = getCustomElementClass(element) ?? {};
  return !!(
    formAssociated &&
    observedAttributes?.includes('minlength') &&
    observedAttributes?.includes('maxlength')
  );
}

export function isTextualFormElement(element: HTMLElement): boolean {
  return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
}

export function isFormAssociatedCustomElement(
  element: HTMLElement,
): element is FormAssociatedCustomElement {
  return getCustomElementClass(element)?.formAssociated === true;
}

function getCustomElementClass(
  element: HTMLElement,
):
  | (CustomElementConstructor & {formAssociated?: boolean; observedAttributes?: string[]})
  | undefined {
  return typeof customElements === 'object'
    ? customElements.get(element.tagName.toLowerCase())
    : undefined;
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
