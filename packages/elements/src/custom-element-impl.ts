/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';

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
// browsers. Here, the mechanism for defining a custom element class is abstracted, with two
// possible implementations available.
//
// A major goal of the workaround was to keep the code actually implementing the custom element as
// unaffected as possible, and not introduce any significant overhead in the common case (ES2015-
// based custom elements).
//
// The behavior required from the custom element class is specified by an implementation of
// `NgElementBehavior`. The creation of this implementation is abstracted, such that the base class
// of the implementation can be changed depending on which custom element definition approach is
// used.
//
// In ES2015 mode, the instance of `NgElementBehavior` is _also_ the custom element itself (that is,
// it extends `HTMLElement`). This is nearly identical to how custom elements worked before this
// workaround abstraction was introduced, and has the least overhead possible.
//
// In `Reflect.construct` mode, the instance of `NgElementBehavior` is independent. A separate,
// prototype-based class is created which extends from `HTMLElement` using `Reflect.construct`, and
// custom element hooks are forwarded to a wrapped `NgElementBehavior` instance.
//
// To work in this dual mode, `NgElementBehavior` implementations cannot assume that `this` refers
// to the `HTMLElement` instance for the element, and must be a little clever about routing such
// operations.

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

/**
 * The implementation of custom element logic, including handlers for various callbacks.
 *
 * Classes which implement this interface should be defined via `newCustomElementWithBehavior`,
 * which allows for their definition using different base classes, depending on the mode of custom
 * element definition in use (ES2015 extension of `HTMLElement`, or `Reflect.construct` based
 * construction of `HTMLElement` derivations). See the file where this interface is defined for
 * additional context.
 */
export interface NgElementBehavior<T extends NgElementBehavior<T>> {
  /**
   * Should return `this`, the current behavior instance.
   *
   * Combined with the requirement for the `CustomElement` interface to have a `behavior` field,
   * requiring this field ensures that accessing `.behavior` on the custom element instance always
   * returns the `NgElementBehavior` instance driving it, regardless of whether the behavior _is_
   * the custom element instance or is defined separately.
   */
  readonly behavior: T;

  /**
   * Prototype for a handler that responds to a change in an observed attribute.
   * @param attrName The name of the attribute that has changed.
   * @param oldValue The previous value of the attribute.
   * @param newValue The new value of the attribute.
   * @param namespace The namespace in which the attribute is defined.
   * @returns Nothing.
   */
  attributeChangedCallback(
      attrName: string, oldValue: string|null, newValue: string, namespace?: string): void;

  /**
   * Prototype for a handler that responds to the insertion of the custom element in the DOM.
   * @returns Nothing.
   */
  connectedCallback(): void;

  /**
   * Prototype for a handler that responds to the deletion of the custom element from the DOM.
   * @returns Nothing.
   */
  disconnectedCallback(): void;
}

/**
 * Constructor type for a `CustomElement` based on a specific `NgElementBehavior`.
 */
export interface CustomElementClass<T extends NgElementBehavior<T>> {
  new(): CustomElement<T>;
}

/**
 * An instance of a custom element that's implemented via an `NgElementBehavior`.
 *
 * Depending on the mechanism used to define this class, the `NgElementBehavior` instance may _be_
 * the custom element instance itself, or it may be a different object.
 */
export interface CustomElement<T extends NgElementBehavior<T>> extends NgElement {
  behavior: T;
}

/**
 * Constructor type for a class which implements `NgElementBehavior`.
 *
 *
 */
export interface NgElementBehaviorCtor<T extends NgElementBehavior<T>> {
  new(injector?: Injector, htmlElement?: HTMLElement): T;

  /**
   * Custom element classes (and thus `NgElementBehavior` classes) have a static property that
   * controls which attributes fire `attributeChangedCallback`s.
   *
   * Note that this uses bracket property access, as it should not ever be minified.
   */
  ['observedAttributes']: string[];
}

/**
 * A constructor type which has no arguments.
 */
export interface NoArgConstructor {
  new(): Object;
}

/**
 * An empty base class used in the `Reflect.construct` method for defining a custom element class.
 *
 * In this method, `NgElementBehavior` implementation classes are defined with `EmptyBase` as a base
 * class.
 */
class EmptyBase {}

/**
 * Create a new `CustomElementClass` backed by an `NgElementBehavior`, using ES2015 class extension.
 *
 * In this mode, the behavior class _is_ the custom element class (that is, it extends from
 * `HTMLElement` via the base class `NgElement`).
 */
function es2015CustomElement<T extends NgElementBehavior<T>>(
    newBehavior: (baseClass: NoArgConstructor) => NgElementBehaviorCtor<T>): CustomElementClass<T> {
  // TypeScript doesn't support typing abstract constructors very well, so cast `NgElement` here to
  // pretend like it's a real, concrete base class with no constructor arguments.
  return newBehavior(NgElement as unknown as NoArgConstructor) as unknown as CustomElementClass<T>;
}

/**
 * Create a new `CustomElementClass` backed by an `NgElementBehavior`, using `Reflect.construct`.
 *
 * In this mode, a custom element class is defined using `Reflect.construct`, wrapping and
 * delegating to an instance of a separate `NgElementBehavior` implementation.
 */
const reflectionCustomElement:
    typeof es2015CustomElement = function reflectionCustomElement<T extends NgElementBehavior<T>>(
        newBehavior: (baseClass: NoArgConstructor) => NgElementBehaviorCtor<T>):
        CustomElementClass<T> {
  // Define the behavior class as a separate class, extending from `EmptyBase`.
  const BehaviorImpl = newBehavior(EmptyBase);

  // Constructor function for the reflection-based custom element.
  function ReflectionNgElement(injector?: Injector) {
    // Use `Reflect.construct` for instantiation.
    const impl = Reflect.construct(HTMLElement, [], ReflectionNgElement) as CustomElement<T>;

    // Each custom element instance has its own internal instance of the behavior class.
    impl.behavior = new BehaviorImpl(injector, impl);
    return impl;
  }

  // Set up the inheritance chain so that `ReflectionNgElement` extends from `HTMLElement`.
  Object.setPrototypeOf(ReflectionNgElement.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ReflectionNgElement, HTMLElement);

  // Custom elements have a static property that controls which attributes trigger
  // `attributeChangedCallback`s. Forward that from the behavior class.
  // Note that this uses bracket property access, as it should not ever be minified.
  ReflectionNgElement['observedAttributes'] = BehaviorImpl['observedAttributes'];

  // Forward the custom element callbacks to the behavior instance. Here we're using
  // `NgElement` as a convenient interface, which is structurally compatible even though the
  // prototype is not actually `instanceof NgElement`.
  const prototype: NgElement = ReflectionNgElement.prototype;
  prototype.attributeChangedCallback = function(
      this: CustomElement<T>, attrName: string, oldValue: string|null, newValue: string,
      namespace?: string): void {
    this.behavior.attributeChangedCallback(attrName, oldValue, newValue, namespace);
  };
  prototype.connectedCallback = function(this: CustomElement<T>): void {
    this.behavior.connectedCallback();
  };
  prototype.disconnectedCallback = function(this: CustomElement<T>): void {
    this.behavior.disconnectedCallback();
  };

  return ReflectionNgElement as unknown as CustomElementClass<T>;
};

/**
 * Define a new custom element class, based on a given `NgElementBehavior` class.
 *
 * The mechanism by which this custom element class is defined and constructed can be switched from
 * ES2015 class extension to `Reflect.construct` by calling `useReflectionBasedCustomElements`.
 */
export let newCustomElementWithBehavior = es2015CustomElement;

/**
 * Switch to using `Reflect.construct` based custom elements instead of ES2015 classes.
 *
 * This is only useful to work around cases where custom elements still need to be created, but the
 * code to do so must be downleveled to ES5.
 */
export function useReflectionBasedCustomElements(): void {
  newCustomElementWithBehavior = reflectionCustomElement;
}
