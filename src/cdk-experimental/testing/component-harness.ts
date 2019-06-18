/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestElement} from './test-element';

/** An async function that returns a promise when called. */
export type AsyncFn<T> = () => Promise<T>;

/**
 * Interface used to load ComponentHarness objects. This interface is used by test authors to
 * instantiate `ComponentHarness`es.
 */
export interface HarnessLoader {
  /**
   * Searches for an element with the given selector under the current instances's root element,
   * and returns a `HarnessLoader` rooted at the matching element. If multiple elements match the
   * selector, the first is used. If no elements match, an error is thrown.
   * @param selector The selector for the root element of the new `HarnessLoader`
   * @return A `HarnessLoader` rooted at the element matching the given selector.
   * @throws If a matching element can't be found.
   */
  getChildLoader(selector: string): Promise<HarnessLoader>;

  /**
   * Searches for all elements with the given selector under the current instances's root element,
   * and returns an array of `HarnessLoader`s, one for each matching element, rooted at that
   * element.
   * @param selector The selector for the root element of the new `HarnessLoader`
   * @return A list of `HarnessLoader`s, one for each matching element, rooted at that element.
   */
  getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;

  /**
   * Searches for an instance of the component corresponding to the given harness type under the
   * `HarnessLoader`'s root element, and returns a `ComponentHarness` for that instance. If multiple
   * matching components are found, a harness for the first one is returned. If no matching
   * component is found, an error is thrown.
   * @param harnessType The type of harness to create
   * @return An instance of the given harness type
   * @throws If a matching component instance can't be found.
   */
  getHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>):
      Promise<T>;

  /**
   * Searches for all instances of the component corresponding to the given harness type under the
   * `HarnessLoader`'s root element, and returns a list `ComponentHarness` for each instance.
   * @param harnessType The type of harness to create
   * @return A list instances of the given harness type.
   */
  getAllHarnesses<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>):
      Promise<T[]>;
}

/**
 * Interface used to create asynchronous locator functions used find elements and component
 * harnesses. This interface is used by `ComponentHarness` authors to create locator functions for
 * their `ComponentHarenss` subclass.
 */
export interface LocatorFactory {
  /** Gets a locator factory rooted at the document root. */
  documentRootLocatorFactory(): LocatorFactory;

  /** The root element of this `LocatorFactory` as a `TestElement`. */
  rootElement: TestElement;

  /**
   * Creates an asynchronous locator function that can be used to search for elements with the given
   * selector under the root element of this `LocatorFactory`. When the resulting locator function
   * is invoked, if multiple matching elements are found, the first element is returned. If no
   * elements are found, an error is thrown.
   * @param selector The selector for the element that the locator function should search for.
   * @return An asynchronous locator function that searches for elements with the given selector,
   *     and either finds one or throws an error
   */
  locatorFor(selector: string): AsyncFn<TestElement>;

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` for a
   * component matching the given harness type under the root element of this `LocatorFactory`.
   * When the resulting locator function is invoked, if multiple matching components are found, a
   * harness for the first one is returned. If no components are found, an error is thrown.
   * @param harnessType The type of harness to search for.
   * @return An asynchronous locator function that searches components matching the given harness
   *     type, and either returns a `ComponentHarness` for the component, or throws an error.
   */
  locatorFor<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>):
      AsyncFn<T>;

  /**
   * Creates an asynchronous locator function that can be used to search for elements with the given
   * selector under the root element of this `LocatorFactory`. When the resulting locator function
   * is invoked, if multiple matching elements are found, the first element is returned. If no
   * elements are found, null is returned.
   * @param selector The selector for the element that the locator function should search for.
   * @return An asynchronous locator function that searches for elements with the given selector,
   *     and either finds one or returns null.
   */
  locatorForOptional(selector: string): AsyncFn<TestElement | null>;

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` for a
   * component matching the given harness type under the root element of this `LocatorFactory`.
   * When the resulting locator function is invoked, if multiple matching components are found, a
   * harness for the first one is returned. If no components are found, null is returned.
   * @param harnessType The type of harness to search for.
   * @return An asynchronous locator function that searches components matching the given harness
   *     type, and either returns a `ComponentHarness` for the component, or null if none is found.
   */
  locatorForOptional<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>):
      AsyncFn<T | null>;

  /**
   * Creates an asynchronous locator function that can be used to search for a list of elements with
   * the given selector under the root element of this `LocatorFactory`. When the resulting locator
   * function is invoked, a list of matching elements is returned.
   * @param selector The selector for the element that the locator function should search for.
   * @return An asynchronous locator function that searches for elements with the given selector,
   *     and either finds one or throws an error
   */
  locatorForAll(selector: string): AsyncFn<TestElement[]>;

  /**
   * Creates an asynchronous locator function that can be used to find a list of
   * `ComponentHarness`es for all components matching the given harness type under the root element
   * of this `LocatorFactory`. When the resulting locator function is invoked, a list of
   * `ComponentHarness`es for the matching components is returned.
   * @param harnessType The type of harness to search for.
   * @return An asynchronous locator function that searches components matching the given harness
   *     type, and returns a list of `ComponentHarness`es.
   */
  locatorForAll<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>):
      AsyncFn<T[]>;
}

/**
 * Base class for component harnesses that all component harness authors should extend. This base
 * component harness provides the basic ability to locate element and sub-component harness. It
 * should be inherited when defining user's own harness.
 */
export abstract class ComponentHarness {
  constructor(private readonly locatorFactory: LocatorFactory) {}

  /** Gets a `Promise` for the `TestElement` representing the host element of the component. */
  async host(): Promise<TestElement> {
    return this.locatorFactory.rootElement;
  }

  /**
   * Gets a `LocatorFactory` for the document root element. This factory can be used to create
   * locators for elements that a component creates outside of its own root element. (e.g. by
   * appending to document.body).
   */
  protected documentRootLocatorFactory(): LocatorFactory {
    return this.locatorFactory.documentRootLocatorFactory();
  }

  /**
   * Creates an asynchronous locator function that can be used to search for elements with the given
   * selector under the host element of this `ComponentHarness`. When the resulting locator function
   * is invoked, if multiple matching elements are found, the first element is returned. If no
   * elements are found, an error is thrown.
   * @param selector The selector for the element that the locator function should search for.
   * @return An asynchronous locator function that searches for elements with the given selector,
   *     and either finds one or throws an error
   */
  protected locatorFor(selector: string): AsyncFn<TestElement>;

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` for a
   * component matching the given harness type under the host element of this `ComponentHarness`.
   * When the resulting locator function is invoked, if multiple matching components are found, a
   * harness for the first one is returned. If no components are found, an error is thrown.
   * @param harnessType The type of harness to search for.
   * @return An asynchronous locator function that searches components matching the given harness
   *     type, and either returns a `ComponentHarness` for the component, or throws an error.
   */
  protected locatorFor<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>): AsyncFn<T>;

  protected locatorFor(arg: any): any {
    return this.locatorFactory.locatorFor(arg);
  }

  /**
   * Creates an asynchronous locator function that can be used to search for elements with the given
   * selector under the host element of this `ComponentHarness`. When the resulting locator function
   * is invoked, if multiple matching elements are found, the first element is returned. If no
   * elements are found, null is returned.
   * @param selector The selector for the element that the locator function should search for.
   * @return An asynchronous locator function that searches for elements with the given selector,
   *     and either finds one or returns null.
   */
  protected locatorForOptional(selector: string): AsyncFn<TestElement | null>;

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` for a
   * component matching the given harness type under the host element of this `ComponentHarness`.
   * When the resulting locator function is invoked, if multiple matching components are found, a
   * harness for the first one is returned. If no components are found, null is returned.
   * @param harnessType The type of harness to search for.
   * @return An asynchronous locator function that searches components matching the given harness
   *     type, and either returns a `ComponentHarness` for the component, or null if none is found.
   */
  protected locatorForOptional<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>): AsyncFn<T | null>;

  protected locatorForOptional(arg: any): any {
    return this.locatorFactory.locatorForOptional(arg);
  }

  /**
   * Creates an asynchronous locator function that can be used to search for a list of elements with
   * the given selector under the host element of this `ComponentHarness`. When the resulting
   * locator function is invoked, a list of matching elements is returned.
   * @param selector The selector for the element that the locator function should search for.
   * @return An asynchronous locator function that searches for elements with the given selector,
   *     and either finds one or throws an error
   */
  protected locatorForAll(selector: string): AsyncFn<TestElement[]>;

  /**
   * Creates an asynchronous locator function that can be used to find a list of
   * `ComponentHarness`es for all components matching the given harness type under the host element
   * of this `ComponentHarness`. When the resulting locator function is invoked, a list of
   * `ComponentHarness`es for the matching components is returned.
   * @param harnessType The type of harness to search for.
   * @return An asynchronous locator function that searches components matching the given harness
   *     type, and returns a list of `ComponentHarness`es.
   */
  protected locatorForAll<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>):
      AsyncFn<T[]>;

  protected locatorForAll(arg: any): any {
    return this.locatorFactory.locatorForAll(arg);
  }
}

/** Constructor for a ComponentHarness subclass. */
export interface ComponentHarnessConstructor<T extends ComponentHarness> {
  new(locatorFactory: LocatorFactory): T;

  /**
   * `ComponentHarness` subclasses must specify a static `hostSelector` property that is used to
   * find the host element for the corresponding component. This property should match the selector
   * for the Angular component.
   */
  hostSelector: string;
}
