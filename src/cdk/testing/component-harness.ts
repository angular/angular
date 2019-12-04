/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestElement} from './test-element';

/** An async function that returns a promise when called. */
export type AsyncFactoryFn<T> = () => Promise<T>;

/** An async function that takes an item and returns a boolean promise */
export type AsyncPredicate<T> = (item: T) => Promise<boolean>;

/** An async function that takes an item and an option value and returns a boolean promise. */
export type AsyncOptionPredicate<T, O> = (item: T, option: O) => Promise<boolean>;

/**
 * A query for a `ComponentHarness`, which is expressed as either a `ComponentHarnessConstructor` or
 * a `HarnessPredicate`.
 */
export type HarnessQuery<T extends ComponentHarness> =
    ComponentHarnessConstructor<T> | HarnessPredicate<T>;

/**
 * The result type obtained when searching using a particular list of queries. This type depends on
 * the particular items being queried.
 * - If one of the queries is for a `ComponentHarnessConstructor<C1>`, it means that the result
 *   might be a harness of type `C1`
 * - If one of the queries is for a `HarnessPredicate<C2>`, it means that the result might be a
 *   harness of type `C2`
 * - If one of the queries is for a `string`, it means that the result might be a `TestElement`.
 *
 * Since we don't know for sure which query will match, the result type if the union of the types
 * for all possible results.
 *
 * e.g.
 * The type:
 * `LocatorFnResult&lt;[
 *   ComponentHarnessConstructor&lt;MyHarness&gt;,
 *   HarnessPredicate&lt;MyOtherHarness&gt;,
 *   string
 * ]&gt;`
 * is equivalent to:
 * `MyHarness | MyOtherHarness | TestElement`.
 */
export type LocatorFnResult<T extends (HarnessQuery<any> | string)[]> = {
  [I in keyof T]:
      // Map `ComponentHarnessConstructor<C>` to `C`.
      T[I] extends new (...args: any[]) => infer C ? C :
      // Map `HarnessPredicate<C>` to `C`.
      T[I] extends { harnessType: new (...args: any[]) => infer C } ? C :
      // Map `string` to `TestElement`.
      T[I] extends string ? TestElement :
      // Map everything else to `never` (should not happen due to the type constraint on `T`).
      never;
}[number];


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
   * @param query A query for a harness to create
   * @return An instance of the given harness type
   * @throws If a matching component instance can't be found.
   */
  getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T>;

  /**
   * Searches for all instances of the component corresponding to the given harness type under the
   * `HarnessLoader`'s root element, and returns a list `ComponentHarness` for each instance.
   * @param query A query for a harness to create
   * @return A list instances of the given harness type.
   */
  getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]>;
}

/**
 * Interface used to create asynchronous locator functions used find elements and component
 * harnesses. This interface is used by `ComponentHarness` authors to create locator functions for
 * their `ComponentHarness` subclass.
 */
export interface LocatorFactory {
  /** Gets a locator factory rooted at the document root. */
  documentRootLocatorFactory(): LocatorFactory;

  /** The root element of this `LocatorFactory` as a `TestElement`. */
  rootElement: TestElement;

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
   * or element under the root element of this `LocatorFactory`.
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for the
   *   first element or harness matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If no matches are found, the
   *   `Promise` rejects. The type that the `Promise` resolves to is a union of all result types for
   *   each query.
   *
   * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
   * `DivHarness.hostSelector === 'div'`:
   * - `await lf.locatorFor(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
   * - `await lf.locatorFor('div', DivHarness)()` gets a `TestElement` instance for `#d1`
   * - `await lf.locatorFor('span')()` throws because the `Promise` rejects.
   */
  locatorFor<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T>>;

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
   * or element under the root element of this `LocatorFactory`.
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for the
   *   first element or harness matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If no matches are found, the
   *   `Promise` is resolved with `null`. The type that the `Promise` resolves to is a union of all
   *   result types for each query or null.
   *
   * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
   * `DivHarness.hostSelector === 'div'`:
   * - `await lf.locatorForOptional(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
   * - `await lf.locatorForOptional('div', DivHarness)()` gets a `TestElement` instance for `#d1`
   * - `await lf.locatorForOptional('span')()` gets `null`.
   */
  locatorForOptional<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T> | null>;

  /**
   * Creates an asynchronous locator function that can be used to find `ComponentHarness` instances
   * or elements under the root element of this `LocatorFactory`.
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for all
   *   elements and harnesses matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If an element matches more than
   *   one `ComponentHarness` class, the locator gets an instance of each for the same element. If
   *   an element matches multiple `string` selectors, only one `TestElement` instance is returned
   *   for that element. The type that the `Promise` resolves to is an array where each element is
   *   the union of all result types for each query.
   *
   * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
   * `DivHarness.hostSelector === 'div'` and `IdIsD1Harness.hostSelector === '#d1'`:
   * - `await lf.locatorForAll(DivHarness, 'div')()` gets `[
   *     DivHarness, // for #d1
   *     TestElement, // for #d1
   *     DivHarness, // for #d2
   *     TestElement // for #d2
   *   ]`
   * - `await lf.locatorForAll('div', '#d1')()` gets `[
   *     TestElement, // for #d1
   *     TestElement // for #d2
   *   ]`
   * - `await lf.locatorForAll(DivHarness, IdIsD1Harness)()` gets `[
   *     DivHarness, // for #d1
   *     IdIsD1Harness, // for #d1
   *     DivHarness // for #d2
   *   ]`
   * - `await lf.locatorForAll('span')()` gets `[]`.
   */
  locatorForAll<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T>[]>;

  /**
   * Gets a `HarnessLoader` instance for an element under the root of this `LocatorFactory`.
   * @param selector The selector for the root element.
   * @return A `HarnessLoader` rooted at the first element matching the given selector.
   * @throws If no matching element is found for the given selector.
   */
  harnessLoaderFor(selector: string): Promise<HarnessLoader>;

  /**
   * Gets a `HarnessLoader` instance for an element under the root of this `LocatorFactory`
   * @param selector The selector for the root element.
   * @return A `HarnessLoader` rooted at the first element matching the given selector, or null if
   *     no matching element is found.
   */
  harnessLoaderForOptional(selector: string): Promise<HarnessLoader | null>;

  /**
   * Gets a list of `HarnessLoader` instances, one for each matching element.
   * @param selector The selector for the root element.
   * @return A list of `HarnessLoader`, one rooted at each element matching the given selector.
   */
  harnessLoaderForAll(selector: string): Promise<HarnessLoader[]>;

  /**
   * Flushes change detection and async tasks captured in the Angular zone.
   * In most cases it should not be necessary to call this manually. However, there may be some edge
   * cases where it is needed to fully flush animation events.
   */
  forceStabilize(): Promise<void>;

  /**
   * Waits for all scheduled or running async tasks to complete. This allows harness
   * authors to wait for async tasks outside of the Angular zone.
   */
  waitForTasksOutsideAngular(): Promise<void>;
}

/**
 * Base class for component harnesses that all component harness authors should extend. This base
 * component harness provides the basic ability to locate element and sub-component harness. It
 * should be inherited when defining user's own harness.
 */
export abstract class ComponentHarness {
  constructor(protected readonly locatorFactory: LocatorFactory) {}

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
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
   * or element under the host element of this `ComponentHarness`.
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for the
   *   first element or harness matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If no matches are found, the
   *   `Promise` rejects. The type that the `Promise` resolves to is a union of all result types for
   *   each query.
   *
   * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
   * `DivHarness.hostSelector === 'div'`:
   * - `await ch.locatorFor(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
   * - `await ch.locatorFor('div', DivHarness)()` gets a `TestElement` instance for `#d1`
   * - `await ch.locatorFor('span')()` throws because the `Promise` rejects.
   */
  protected locatorFor<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T>> {
    return this.locatorFactory.locatorFor(...queries);
  }

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
   * or element under the host element of this `ComponentHarness`.
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for the
   *   first element or harness matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If no matches are found, the
   *   `Promise` is resolved with `null`. The type that the `Promise` resolves to is a union of all
   *   result types for each query or null.
   *
   * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
   * `DivHarness.hostSelector === 'div'`:
   * - `await ch.locatorForOptional(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
   * - `await ch.locatorForOptional('div', DivHarness)()` gets a `TestElement` instance for `#d1`
   * - `await ch.locatorForOptional('span')()` gets `null`.
   */
  protected locatorForOptional<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T> | null> {
    return this.locatorFactory.locatorForOptional(...queries);
  }

  /**
   * Creates an asynchronous locator function that can be used to find `ComponentHarness` instances
   * or elements under the host element of this `ComponentHarness`.
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for all
   *   elements and harnesses matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If an element matches more than
   *   one `ComponentHarness` class, the locator gets an instance of each for the same element. If
   *   an element matches multiple `string` selectors, only one `TestElement` instance is returned
   *   for that element. The type that the `Promise` resolves to is an array where each element is
   *   the union of all result types for each query.
   *
   * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
   * `DivHarness.hostSelector === 'div'` and `IdIsD1Harness.hostSelector === '#d1'`:
   * - `await ch.locatorForAll(DivHarness, 'div')()` gets `[
   *     DivHarness, // for #d1
   *     TestElement, // for #d1
   *     DivHarness, // for #d2
   *     TestElement // for #d2
   *   ]`
   * - `await ch.locatorForAll('div', '#d1')()` gets `[
   *     TestElement, // for #d1
   *     TestElement // for #d2
   *   ]`
   * - `await ch.locatorForAll(DivHarness, IdIsD1Harness)()` gets `[
   *     DivHarness, // for #d1
   *     IdIsD1Harness, // for #d1
   *     DivHarness // for #d2
   *   ]`
   * - `await ch.locatorForAll('span')()` gets `[]`.
   */
  protected locatorForAll<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T>[]> {
    return this.locatorFactory.locatorForAll(...queries);
  }

  /**
   * Flushes change detection and async tasks in the Angular zone.
   * In most cases it should not be necessary to call this manually. However, there may be some edge
   * cases where it is needed to fully flush animation events.
   */
  protected async forceStabilize() {
    return this.locatorFactory.forceStabilize();
  }

  /**
   * Waits for all scheduled or running async tasks to complete. This allows harness
   * authors to wait for async tasks outside of the Angular zone.
   */
  protected async waitForTasksOutsideAngular() {
    return this.locatorFactory.waitForTasksOutsideAngular();
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

/** A set of criteria that can be used to filter a list of `ComponentHarness` instances. */
export interface BaseHarnessFilters {
  /** Only find instances whose host element matches the given selector. */
  selector?: string;
  /** Only find instances that are nested under an element with the given selector. */
  ancestor?: string;
}

/**
 * A class used to associate a ComponentHarness class with predicates functions that can be used to
 * filter instances of the class.
 */
export class HarnessPredicate<T extends ComponentHarness> {
  private _predicates: AsyncPredicate<T>[] = [];
  private _descriptions: string[] = [];
  private _ancestor: string;

  constructor(public harnessType: ComponentHarnessConstructor<T>, options: BaseHarnessFilters) {
    this._addBaseOptions(options);
  }

  /**
   * Checks if the specified nullable string value matches the given pattern.
   * @param value The nullable string value to check, or a Promise resolving to the
   *   nullable string value.
   * @param pattern The pattern the value is expected to match. If `pattern` is a string,
   *   `value` is expected to match exactly. If `pattern` is a regex, a partial match is
   *   allowed. If `pattern` is `null`, the value is expected to be `null`.
   * @return Whether the value matches the pattern.
   */
  static async stringMatches(value: string | null | Promise<string | null>,
                             pattern: string | RegExp | null): Promise<boolean> {
    value = await value;
    if (pattern === null) {
      return value === null;
    } else if (value === null) {
      return false;
    }
    return typeof pattern === 'string' ? value === pattern : pattern.test(value);
  }

  /**
   * Adds a predicate function to be run against candidate harnesses.
   * @param description A description of this predicate that may be used in error messages.
   * @param predicate An async predicate function.
   * @return this (for method chaining).
   */
  add(description: string, predicate: AsyncPredicate<T>) {
    this._descriptions.push(description);
    this._predicates.push(predicate);
    return this;
  }

  /**
   * Adds a predicate function that depends on an option value to be run against candidate
   * harnesses. If the option value is undefined, the predicate will be ignored.
   * @param name The name of the option (may be used in error messages).
   * @param option The option value.
   * @param predicate The predicate function to run if the option value is not undefined.
   * @return this (for method chaining).
   */
  addOption<O>(name: string, option: O | undefined, predicate: AsyncOptionPredicate<T, O>) {
    if (option !== undefined) {
      this.add(`${name} = ${_valueAsString(option)}`, item => predicate(item, option));
    }
    return this;
  }

  /**
   * Filters a list of harnesses on this predicate.
   * @param harnesses The list of harnesses to filter.
   * @return A list of harnesses that satisfy this predicate.
   */
  async filter(harnesses: T[]): Promise<T[]> {
    const results = await Promise.all(harnesses.map(h => this.evaluate(h)));
    return harnesses.filter((_, i) => results[i]);
  }

  /**
   * Evaluates whether the given harness satisfies this predicate.
   * @param harness The harness to check
   * @return A promise that resolves to true if the harness satisfies this predicate,
   *   and resolves to false otherwise.
   */
  async evaluate(harness: T): Promise<boolean> {
    const results = await Promise.all(this._predicates.map(p => p(harness)));
    return results.reduce((combined, current) => combined && current, true);
  }

  /** Gets a description of this predicate for use in error messages. */
  getDescription() {
    return this._descriptions.join(', ');
  }

  /** Gets the selector used to find candidate elements. */
  getSelector() {
    return this._ancestor.split(',')
        .map(part => `${part.trim()} ${this.harnessType.hostSelector}`.trim())
        .join(',');
  }

  /** Adds base options common to all harness types. */
  private _addBaseOptions(options: BaseHarnessFilters) {
    this._ancestor = options.ancestor || '';
    if (this._ancestor) {
      this._descriptions.push(`has ancestor matching selector "${this._ancestor}"`);
    }
    const selector = options.selector;
    if (selector !== undefined) {
      this.add(`host matches selector "${selector}"`, async item => {
        return (await item.host()).matchesSelector(selector);
      });
    }
  }
}

/** Represent a value as a string for the purpose of logging. */
function _valueAsString(value: unknown) {
  if (value === undefined) {
    return 'undefined';
  }
  // `JSON.stringify` doesn't handle RegExp properly, so we need a custom replacer.
  try {
    return JSON.stringify(value, (_, v) =>
        v instanceof RegExp ? `/${v.toString()}/` :
            typeof v === 'string' ? v.replace('/\//g', '\\/') : v
    ).replace(/"\/\//g, '\\/').replace(/\/\/"/g, '\\/').replace(/\\\//g, '/');
  } catch {
    // `JSON.stringify` will throw if the object is cyclical,
    // in this case the best we can do is report the value as `{...}`.
    return '{...}';
  }
}
