/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element as protractorElement, ElementFinder} from 'protractor';

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLocator,
  QueryOptions
} from './component-harness';
import {TestElement} from './test-element';

/**
 * Component harness factory for protractor.
 * The function will not try to fetch the host element of harness at once, which
 * is for performance purpose; however, this is the most common way to load
 * protractor harness. If you do care whether the host element is present when
 * loading harness, using the load function that accepts extra searching
 * options.
 * @param componentHarness: Type of user defined harness.
 * @param rootSelector: Optional. CSS selector to specify the root of component.
 * Set to 'body' by default
 */
export async function load<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>,
    rootSelector: string): Promise<T>;

/**
 * Component harness factory for protractor.
 * @param componentHarness: Type of user defined harness.
 * @param rootSelector: Optional. CSS selector to specify the root of component.
 * Set to 'body' by default.
 * @param options Optional. Extra searching options
 */
export async function load<T extends ComponentHarness>(
  componentHarness: ComponentHarnessConstructor<T>, rootSelector?: string,
  options?: QueryOptions): Promise<T|null>;

export async function load<T extends ComponentHarness>(
  componentHarness: ComponentHarnessConstructor<T>, rootSelector = 'body',
  options?: QueryOptions): Promise<T|null> {
  const root = await getElement(rootSelector, undefined, options);
  return root && new componentHarness(new ProtractorLocator(root));
}

/**
 * Gets the corresponding ElementFinder for the root of a TestElement.
 */
export function getElementFinder(testElement: TestElement): ElementFinder {
  if (testElement instanceof ProtractorElement) {
    return testElement.element;
  }

  throw Error(`Expected an instance of ProtractorElement, got ${testElement}`);
}

class ProtractorLocator implements HarnessLocator {
  private readonly _root: ProtractorElement;

  constructor(private _rootFinder: ElementFinder) {
    this._root = new ProtractorElement(this._rootFinder);
  }

  host(): TestElement {
    return this._root;
  }

  async querySelector(selector: string, options?: QueryOptions): Promise<TestElement|null> {
    const finder = await getElement(selector, this._rootFinder, options);
    return finder && new ProtractorElement(finder);
  }

  async querySelectorAll(selector: string): Promise<TestElement[]> {
    const elementFinders = this._rootFinder.all(by.css(selector));
    return elementFinders.reduce(
      (result: TestElement[], el: ElementFinder) =>
          el ? result.concat([new ProtractorElement(el)]) : result,
      []);
  }

  async load<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>, selector: string,
    options?: QueryOptions): Promise<T|null> {
    const root = await getElement(selector, this._rootFinder, options);
    return root && new componentHarness(new ProtractorLocator(root));
  }

  async loadAll<T extends ComponentHarness>(
      componentHarness: ComponentHarnessConstructor<T>,
      rootSelector: string): Promise<T[]> {
    const roots = this._rootFinder.all(by.css(rootSelector));
    return roots.reduce(
        (result: T[], el: ElementFinder) =>
            el ? result.concat(new componentHarness(new ProtractorLocator(el))) : result,
        []);
  }
}

class ProtractorElement implements TestElement {
  constructor(readonly element: ElementFinder) {}

  async blur(): Promise<void> {
    return this.element['blur']();
  }

  async clear(): Promise<void> {
    return this.element.clear();
  }

  async click(): Promise<void> {
    return this.element.click();
  }

  async focus(): Promise<void> {
    return this.element['focus']();
  }

  async getCssValue(property: string): Promise<string> {
    return this.element.getCssValue(property);
  }

  async hover(): Promise<void> {
    return browser.actions()
        .mouseMove(await this.element.getWebElement())
        .perform();
  }

  async sendKeys(keys: string): Promise<void> {
    return this.element.sendKeys(keys);
  }

  async text(): Promise<string> {
    return this.element.getText();
  }

  async getAttribute(name: string): Promise<string|null> {
    return this.element.getAttribute(name);
  }
}

/**
 * Get an element finder based on the CSS selector and root element.
 * Note that it will check whether the element is present only when
 * Options.allowNull is set. This is for performance purpose.
 * @param selector The CSS selector
 * @param root Optional Search element under the root element. If not set,
 * search element globally. If options.global is set, root is ignored.
 * @param options Optional, extra searching options
 */
async function getElement(selector: string, root?: ElementFinder, options?: QueryOptions):
  Promise<ElementFinder|null> {
  const useGlobalRoot = options && !!options.global;
  const elem = root === undefined || useGlobalRoot ?
      protractorElement(by.css(selector)) : root.element(by.css(selector));
  const allowNull = options !== undefined && options.allowNull !== undefined ?
      options.allowNull : undefined;
  if (allowNull !== undefined && !(await elem.isPresent())) {
    if (allowNull) {
      return null;
    }
    throw Error('Cannot find element based on the CSS selector: ' + selector);
  }
  return elem;
}
