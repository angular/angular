/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AsyncFactoryFn,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLoader,
  HarnessPredicate,
  LocatorFactory
} from './component-harness';
import {TestElement} from './test-element';

function _getErrorForMissingSelector(selector: string): Error {
  return Error(`Expected to find element matching selector: "${selector}", but none was found`);
}

function _getErrorForMissingHarness<T extends ComponentHarness>(
    harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Error {
  const harnessPredicate =
      harnessType instanceof HarnessPredicate ? harnessType : new HarnessPredicate(harnessType);
  const {name, hostSelector} = harnessPredicate.harnessType;
  const restrictions = harnessPredicate.getDescription();
  let message = `Expected to find element for ${name} matching selector: "${hostSelector}"`;
  if (restrictions) {
    message += ` (with restrictions: ${restrictions})`;
  }
  message += ', but none was found';
  return Error(message);
}

/**
 * Base harness environment class that can be extended to allow `ComponentHarness`es to be used in
 * different test environments (e.g. testbed, protractor, etc.). This class implements the
 * functionality of both a `HarnessLoader` and `LocatorFactory`. This class is generic on the raw
 * element type, `E`, used by the particular test environment.
 */
export abstract class HarnessEnvironment<E> implements HarnessLoader, LocatorFactory {
  // Implemented as part of the `LocatorFactory` interface.
  rootElement: TestElement;

  protected constructor(protected rawRootElement: E) {
    this.rootElement = this.createTestElement(rawRootElement);
  }

  // Implemented as part of the `LocatorFactory` interface.
  documentRootLocatorFactory(): LocatorFactory {
    return this.createEnvironment(this.getDocumentRoot());
  }

  // Implemented as part of the `LocatorFactory` interface.
  locatorFor(selector: string): AsyncFactoryFn<TestElement>;
  locatorFor<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T>;
  locatorFor<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T> | HarnessPredicate<T>):
      AsyncFactoryFn<TestElement | T> {
    return async () => {
      if (typeof arg === 'string') {
        const element = (await this.getAllRawElements(arg))[0];
        if (element) {
          return this.createTestElement(element);
        }
        throw _getErrorForMissingSelector(arg);
      } else {
        const harness = (await this._getAllHarnesses(arg))[0];
        if (harness) {
          return harness;
        }
        throw _getErrorForMissingHarness(arg);
      }
    };
  }

  // Implemented as part of the `LocatorFactory` interface.
  locatorForOptional(selector: string): AsyncFactoryFn<TestElement | null>;
  locatorForOptional<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T | null>;
  locatorForOptional<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T> | HarnessPredicate<T>):
      AsyncFactoryFn<TestElement | T | null> {
    return async () => {
      if (typeof arg === 'string') {
        const element = (await this.getAllRawElements(arg))[0];
        return element ? this.createTestElement(element) : null;
      } else {
        const candidates = await this._getAllHarnesses(arg);
        return candidates[0] || null;
      }
    };
  }

  // Implemented as part of the `LocatorFactory` interface.
  locatorForAll(selector: string): AsyncFactoryFn<TestElement[]>;
  locatorForAll<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T[]>;
  locatorForAll<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T> | HarnessPredicate<T>):
      AsyncFactoryFn<TestElement[] | T[]> {
    return async () => {
      if (typeof arg === 'string') {
        return (await this.getAllRawElements(arg)).map(e => this.createTestElement(e));
      } else {
        return this._getAllHarnesses(arg);
      }
    };
  }

  // Implemented as part of the `HarnessLoader` interface.
  getHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Promise<T> {
    return this.locatorFor(harnessType)();
  }

  // Implemented as part of the `HarnessLoader` interface.
  getAllHarnesses<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Promise<T[]> {
    return this.locatorForAll(harnessType)();
  }

  // Implemented as part of the `HarnessLoader` interface.
  async getChildLoader(selector: string): Promise<HarnessLoader> {
    const element = (await this.getAllRawElements(selector))[0];
    if (element) {
      return this.createEnvironment(element);
    }
    throw _getErrorForMissingSelector(selector);
  }

  // Implemented as part of the `HarnessLoader` interface.
  async getAllChildLoaders(selector: string): Promise<HarnessLoader[]> {
    return (await this.getAllRawElements(selector)).map(e => this.createEnvironment(e));
  }

  /** Creates a `ComponentHarness` for the given harness type with the given raw host element. */
  protected createComponentHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: E): T {
    return new harnessType(this.createEnvironment(element));
  }

  /** Gets the root element for the document. */
  protected abstract getDocumentRoot(): E;

  /** Creates a `TestElement` from a raw element. */
  protected abstract createTestElement(element: E): TestElement;

  /** Creates a `HarnessLoader` rooted at the given raw element. */
  protected abstract createEnvironment(element: E): HarnessEnvironment<E>;

  /**
   * Gets a list of all elements matching the given selector under this environment's root element.
   */
  protected abstract getAllRawElements(selector: string): Promise<E[]>;

  private async _getAllHarnesses<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Promise<T[]> {
    const harnessPredicate =
        harnessType instanceof HarnessPredicate ? harnessType : new HarnessPredicate(harnessType);
    const elements = await this.getAllRawElements(harnessPredicate.harnessType.hostSelector);
    return harnessPredicate.filter(elements.map(
        element => this.createComponentHarness(harnessPredicate.harnessType, element)));
  }
}
