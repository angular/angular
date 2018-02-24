/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

const elProto = Element.prototype as any;
const matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
    elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;

/**
 * Provide methods for scheduling the execution of a callback.
 */
export const scheduler = {
  /**
   * Schedule a callback to be called after some delay.
   */
  schedule(cb: () => void, delay: number): () =>
      void{const id = window.setTimeout(cb, delay); return () => window.clearTimeout(id);},

  /**
   * Schedule a callback to be called before the next render.
   * (If `window.requestAnimationFrame()` is not available, use `scheduler.schedule()` instead.)
   */
  scheduleBeforeRender(cb: () => void): () => void{
    // TODO(gkalpak): Implement a better way of accessing `requestAnimationFrame()`
    //                (e.g. accounting for vendor prefix, SSR-compatibility, etc).
    if (typeof window.requestAnimationFrame === 'undefined') {
      return scheduler.schedule(cb, 16);
    } const id = window.requestAnimationFrame(cb);
    return () => window.cancelAnimationFrame(id);
  },
};

/**
 * Convert a camelCased string to kebab-cased.
 */
export function camelToKebabCase(input: string): string {
  return input.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
}

/**
 * Create a `CustomEvent` (even on browsers where `CustomEvent` is not a constructor).
 */
export function createCustomEvent(doc: Document, name: string, detail: any): CustomEvent {
  const bubbles = false;
  const cancelable = false;

  // On IE9-11, `CustomEvent` is not a constructor.
  if (typeof CustomEvent !== 'function') {
    const event = doc.createEvent('CustomEvent');
    event.initCustomEvent(name, bubbles, cancelable, detail);
    return event;
  }

  return new CustomEvent(name, {bubbles, cancelable, detail});
}

/**
 * Return the name of the component or the first line of its stringified version.
 */
export function getComponentName(component: Type<any>): string {
  return (component as any).overriddenName || component.name ||
      component.toString().split('\n', 1)[0];
}

/**
 * Check whether the input is an `Element`.
 */
export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
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

/**
 * Check whether an `Element` matches a CSS selector.
 */
export function matchesSelector(element: Element, selector: string): boolean {
  return matches.call(element, selector);
}

/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export function strictEquals(value1: any, value2: any): boolean {
  return value1 === value2 || (value1 !== value1 && value2 !== value2);
}

/**
 * Throw an error with the specified message.
 * (It provides a centralized place where it is easy to apply some change/behavior to all errors.)
 */
export function throwError(message: string): void {
  throw Error(message);
}
