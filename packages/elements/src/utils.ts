/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentMirror} from '@angular/core';

/**
 * Provide methods for scheduling the execution of a callback.
 */
export const scheduler = {
  /**
   * Schedule a callback to be called after some delay.
   *
   * Returns a function that when executed will cancel the scheduled function.
   */
  schedule(taskFn: () => void, delay: number): () => void {
    const id = setTimeout(taskFn, delay);
    return () => clearTimeout(id);
  },
};

/**
 * Convert a camelCased string to kebab-cased.
 */
export function camelToDashCase(input: string): string {
  return input.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

/**
 * Check whether the input is an `Element`.
 */
export function isElement(node: Node | null): node is Element {
  return !!node && node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Check whether the input is a function.
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * Convert a kebab-cased string to camelCased.
 */
export function kebabToCamelCase(input: string): string {
  return input.replace(/-([a-z\d])/g, (_, char) => char.toUpperCase());
}

let _matches: (this: any, selector: string) => boolean;

/**
 * Check whether an `Element` matches a CSS selector.
 * NOTE: this is duplicated from @angular/upgrade, and can
 * be consolidated in the future
 */
export function matchesSelector(el: any, selector: string): boolean {
  if (!_matches) {
    const elProto = <any>Element.prototype;
    _matches =
      elProto.matches ||
      elProto.matchesSelector ||
      elProto.mozMatchesSelector ||
      elProto.msMatchesSelector ||
      elProto.oMatchesSelector ||
      elProto.webkitMatchesSelector;
  }
  return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}

/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export function strictEquals(value1: any, value2: any): boolean {
  return value1 === value2 || (value1 !== value1 && value2 !== value2);
}

/** Gets a map of default set of attributes to observe and the properties they affect. */
export function getDefaultAttributeToPropertyInputs(inputs: ComponentMirror<unknown>['inputs']) {
  const attributeToPropertyInputs: {
    [key: string]: [propName: string, transform: ((value: any) => any) | undefined];
  } = {};
  inputs.forEach(({propName, templateName, transform}) => {
    attributeToPropertyInputs[camelToDashCase(templateName)] = [propName, transform];
  });

  return attributeToPropertyInputs;
}
