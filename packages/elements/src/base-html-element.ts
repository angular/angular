/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// The primary mechanism of creating a custom element in a modern browser is to write an ES2015
// class that `extends HTMLElement`. Notably, this only works in ES2015 mode - if downleveled to ES5
// using prototype-based syntax for inheritance, extending `HTMLElement` will fail at runtime. Since
// all browsers which support custom elements naturally support ES2015, this is not much of an issue
// in practice.
//
// However, there is a complex scenario in Google's repo where application tests need to be
// downleveled (because of zone.js) and due to build system limitations, they're downleveled to ES5.
// In this case, the browser still supports custom elements, but there is no way to retain the
// ES2015 syntax ordinarily required to define one.
//
// Eventually, the zone.js issue which requires downleveling to ES5 will be addressed. Until then,
// this file allows Angular Elements to work around this problem by enabling custom elements to be
// defined without ES2015 syntax, using the `Reflect.construct` API also supported in modern
// browsers. This is based on the technique outlined in the `native-shim.js` polyfill:
// https://github.com/webcomponents/custom-elements/blob/master/src/native-shim.js
//
// In normal (ES2015) mode, this file simply re-exports `HTMLElement` to use as the base class for
// `NgElement` and thus Angular custom elements. However, an ES5 mode can be enabled, where this
// base class is replaced with a version that uses `Reflect.construct` under the hood, allowing for
// derivation of `HTMLElement` even in ES5-compiled classes.
//
// Note that the main observable side effect of this workaround is that Angular Elements will no
// longer be `instanceof NgElement` when the workaround is in effect. As this workaround is intended
// to only be used in test code, it is expected that this will not be an issue.

/**
 * Implements the functionality needed for a custom element.
 *
 * @publicApi
 */
export abstract class NgElement extends HTMLElement {
  /**
   * Prototype for a handler that responds to a change in an observed attribute.
   * @param attrName The name of the attribute that has changed.
   * @param oldValue The previous value of the attribute.
   * @param newValue The new value of the attribute.
   * @param namespace The namespace in which the attribute is defined.
   * @returns Nothing.
   */
  abstract attributeChangedCallback(
      attrName: string, oldValue: string|null, newValue: string, namespace?: string): void;
  /**
   * Prototype for a handler that responds to the insertion of the custom element in the DOM.
   * @returns Nothing.
   */
  abstract connectedCallback(): void;
  /**
   * Prototype for a handler that responds to the deletion of the custom element from the DOM.
   * @returns Nothing.
   */
  abstract disconnectedCallback(): void;
}

let BaseCustomElement: {new (): HTMLElement} = NgElement as unknown as typeof HTMLElement;

export function getBaseCustomElement(): typeof BaseCustomElement {
  return BaseCustomElement;
}

export function useReflectionBasedElements(): void {
  const NativeHTMLElement = HTMLElement;

  // We go through the trouble of defining this function as a string literal-named field on an
  // object here so that if this code does get minified with advanced property renaming, the
  // `HTMLElement` name of the function is preserved.
  const ReflectionBasedHTMLElement = {
    'HTMLElement': function HTMLElement() {
      // TODO(alxhub): google3 doesn't compile TS code with `Reflect.construct` typings available
      // yet. Update this once they are.
      return (Reflect as any).construct(NativeHTMLElement, [], this.constructor);
    },
  }['HTMLElement'];

  // Do some prototype magic to ensure that `ReflectionBasedHTMLElement` can be extended via normal
  // ES5 class extension.
  ReflectionBasedHTMLElement.prototype = NativeHTMLElement.prototype;

  // These operations don't seem to be strictly necessary in testing, but we err on the side of
  // caution by ensuring that `ReflectionBasedHTMLElement`s look as much like `HTMLElement`s as
  // possible once constructed.
  ReflectionBasedHTMLElement.prototype.constructor = ReflectionBasedHTMLElement;
  Object.setPrototypeOf(ReflectionBasedHTMLElement, NativeHTMLElement);

  // Swap in `ReflectionBasedHTMLElement` to use as the base class for all new Angular Elements.
  BaseCustomElement = ReflectionBasedHTMLElement as unknown as typeof HTMLElement;
}
