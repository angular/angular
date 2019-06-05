/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestElement} from './test-element';

/** Options that can be specified when querying for an Element. */
export interface QueryOptions {
  /**
   * Whether the found element can be null. If allowNull is set, the searching function will always
   * try to fetch the element at once. When the element cannot be found, the searching function
   * should return null if allowNull is set to true, throw an error if allowNull is set to false.
   * If allowNull is not set, the framework will choose the behaviors that make more sense for each
   * test type (e.g. for unit test, the framework will make sure the element is not null; otherwise
   * throw an error); however, the internal behavior is not guaranteed and user should not rely on
   * it. Note that in most cases, you don't need to care about whether an element is present when
   * loading the element and don't need to set this parameter unless you do want to check whether
   * the element is present when calling the searching function. e.g. you want to make sure some
   * element is not there when loading the element in order to check whether a "ngif" works well.
   */
  allowNull?: boolean;
  /**
   * If global is set to true, the selector will match any element on the page and is not limited to
   * the root of the harness. If global is unset or set to false, the selector will only find
   * elements under the current root.
   */
  global?: boolean;
}

/** Interface that is used to find elements in the DOM and create harnesses for them. */
export interface HarnessLocator {
  /**
   * Get the host element of locator.
   */
  host(): TestElement;

  /**
   * Search the first matched test element.
   * @param selector The CSS selector of the test elements.
   * @param options Optional, extra searching options
   */
  querySelector(selector: string, options?: QueryOptions): Promise<TestElement|null>;

  /**
   * Search all matched test elements under current root by CSS selector.
   * @param selector The CSS selector of the test elements.
   */
  querySelectorAll(selector: string): Promise<TestElement[]>;

  /**
   * Load the first matched Component Harness.
   * @param componentHarness Type of user customized harness.
   * @param root CSS root selector of the new component harness.
   * @param options Optional, extra searching options
   */
  load<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>, root: string,
    options?: QueryOptions): Promise<T|null>;

  /**
   * Load all Component Harnesses under current root.
   * @param componentHarness Type of user customized harness.
   * @param root CSS root selector of the new component harnesses.
   */
  loadAll<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>, root: string): Promise<T[]>;
}

/**
 * Base Component Harness
 * This base component harness provides the basic ability to locate element and
 * sub-component harness. It should be inherited when defining user's own
 * harness.
 */
export abstract class ComponentHarness {
  constructor(private readonly locator: HarnessLocator) {}

  /**
   * Get the host element of component harness.
   */
  host(): TestElement {
    return this.locator.host();
  }

  /**
   * Generate a function to find the first matched test element by CSS
   * selector.
   * @param selector The CSS selector of the test element.
   */
  protected find(selector: string): () => Promise<TestElement>;

  /**
   * Generate a function to find the first matched test element by CSS
   * selector.
   * @param selector The CSS selector of the test element.
   * @param options Extra searching options
   */
  protected find(selector: string, options: QueryOptions & {allowNull: true}):
    () => Promise<TestElement|null>;

  /**
   * Generate a function to find the first matched test element by CSS
   * selector.
   * @param selector The CSS selector of the test element.
   * @param options Extra searching options
   */
  protected find(selector: string, options: QueryOptions): () => Promise<TestElement>;

  /**
   * Generate a function to find the first matched Component Harness.
   * @param componentHarness Type of user customized harness.
   * @param root CSS root selector of the new component harness.
   */
  protected find<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>,
    root: string): () => Promise<T>;

  /**
   * Generate a function to find the first matched Component Harness.
   * @param componentHarness Type of user customized harness.
   * @param root CSS root selector of the new component harness.
   * @param options Extra searching options
   */
  protected find<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>, root: string,
    options: QueryOptions & {allowNull: true}): () => Promise<T|null>;

  /**
   * Generate a function to find the first matched Component Harness.
   * @param componentHarness Type of user customized harness.
   * @param root CSS root selector of the new component harness.
   * @param options Extra searching options
   */
  protected find<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>, root: string,
    options: QueryOptions): () => Promise<T>;

  protected find<T extends ComponentHarness>(
    selectorOrComponentHarness: string|ComponentHarnessConstructor<T>,
    selectorOrOptions?: string|QueryOptions,
    options?: QueryOptions): () => Promise<TestElement|T|null> {
    if (typeof selectorOrComponentHarness === 'string') {
      const selector = selectorOrComponentHarness;
      return () => this.locator.querySelector(selector, selectorOrOptions as QueryOptions);
    } else {
      const componentHarness = selectorOrComponentHarness;
      const selector = selectorOrOptions as string;
      return () => this.locator.load(componentHarness, selector, options);
    }
  }

  /**
   * Generate a function to find all matched test elements by CSS selector.
   * @param selector The CSS root selector of elements. It will locate
   * elements under the current root.
   */
  protected findAll(selector: string): () => Promise<TestElement[]>;

  /**
   * Generate a function to find all Component Harnesses under current
   * component harness.
   * @param componentHarness Type of user customized harness.
   * @param root CSS root selector of the new component harnesses. It will
   * locate harnesses under the current root.
   */
  protected findAll<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>,
    root: string): () => Promise<T[]>;

  protected findAll<T extends ComponentHarness>(
    selectorOrComponentHarness: string|ComponentHarnessConstructor<T>,
    root?: string): () => Promise<TestElement[]|T[]> {
    if (typeof selectorOrComponentHarness === 'string') {
      const selector = selectorOrComponentHarness;
      return () => this.locator.querySelectorAll(selector);
    } else {
      const componentHarness = selectorOrComponentHarness;
      return () => this.locator.loadAll(componentHarness, root as string);
    }
  }
}

/** Constructor for a ComponentHarness subclass. */
export interface ComponentHarnessConstructor<T extends ComponentHarness> {
  new(locator: HarnessLocator): T;
}
