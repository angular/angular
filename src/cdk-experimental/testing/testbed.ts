/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  triggerBlur,
  triggerFocus
} from '@angular/cdk/testing';
import {ComponentFixture} from '@angular/core/testing';

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLocator,
  QueryOptions
} from './component-harness';
import {TestElement} from './test-element';

/**
 * Component harness factory for testbed.
 * @param componentHarness: Type of user defined harness.
 * @param fixture: Component Fixture of the component to be tested.
 */
export function load<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>,
    fixture: ComponentFixture<{}>): T {
  const stabilize = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return new componentHarness(new UnitTestLocator(fixture.nativeElement, stabilize));
}

/**
 * Gets the corresponding Element for the root of a TestElement.
 */
export function getNativeElement(testElement: TestElement): Element {
  if (testElement instanceof UnitTestElement) {
    return testElement.element;
  }

  throw Error(`Expected an instance of UnitTestElement, got ${testElement}`);
}

/**
 * Locator implementation for testbed.
 * Note that, this locator is exposed for internal usage, please do not use it.
 */
export class UnitTestLocator implements HarnessLocator {
  private readonly _rootElement: TestElement;

  constructor(private _root: Element, private _stabilize: () => Promise<void>) {
    this._rootElement = new UnitTestElement(_root, this._stabilize);
  }

  host(): TestElement {
    return this._rootElement;
  }

  async querySelector(selector: string, options?: QueryOptions): Promise<TestElement|null> {
    await this._stabilize();
    const e = getElement(selector, this._root, options);
    return e && new UnitTestElement(e, this._stabilize);
  }

  async querySelectorAll(selector: string): Promise<TestElement[]> {
    await this._stabilize();
    return Array.prototype.map.call(
        this._root.querySelectorAll(selector),
        (e: Element) => new UnitTestElement(e, this._stabilize));
  }

  async load<T extends ComponentHarness>(
    componentHarness: ComponentHarnessConstructor<T>, selector: string,
    options?: QueryOptions): Promise<T|null> {
    await this._stabilize();
    const root = getElement(selector, this._root, options);
    return root && new componentHarness(new UnitTestLocator(root, this._stabilize));
  }

  async loadAll<T extends ComponentHarness>(
      componentHarness: ComponentHarnessConstructor<T>,
      rootSelector: string): Promise<T[]> {
    await this._stabilize();
    return Array.prototype.map.call(
        this._root.querySelectorAll(rootSelector),
        (e: Element) => new componentHarness(new UnitTestLocator(e, this._stabilize)));
  }
}

class UnitTestElement implements TestElement {
  constructor(readonly element: Element, private _stabilize: () => Promise<void>) {}

  async blur(): Promise<void> {
    await this._stabilize();
    triggerBlur(this.element as HTMLElement);
    await this._stabilize();
  }

  async clear(): Promise<void> {
    await this._stabilize();
    if (!this._isTextInput(this.element)) {
      throw Error('Attempting to clear an invalid element');
    }
    triggerFocus(this.element as HTMLElement);
    this.element.value = '';
    dispatchFakeEvent(this.element, 'input');
    await this._stabilize();
  }

  async click(): Promise<void> {
    await this._stabilize();
    dispatchMouseEvent(this.element, 'click');
    await this._stabilize();
  }

  async focus(): Promise<void> {
    await this._stabilize();
    triggerFocus(this.element as HTMLElement);
    await this._stabilize();
  }

  async getCssValue(property: string): Promise<string> {
    await this._stabilize();
    // TODO(mmalerba): Consider adding value normalization if we run into common cases where its
    //  needed.
    return getComputedStyle(this.element).getPropertyValue(property);
  }

  async hover(): Promise<void> {
    await this._stabilize();
    dispatchMouseEvent(this.element, 'mouseenter');
    await this._stabilize();
  }

  async sendKeys(keys: string): Promise<void> {
    await this._stabilize();
    triggerFocus(this.element as HTMLElement);
    for (const key of keys) {
      const keyCode = key.charCodeAt(0);
      dispatchKeyboardEvent(this.element, 'keydown', keyCode);
      dispatchKeyboardEvent(this.element, 'keypress', keyCode);
      if (this._isTextInput(this.element)) {
        this.element.value += key;
      }
      dispatchKeyboardEvent(this.element, 'keyup', keyCode);
      if (this._isTextInput(this.element)) {
        dispatchFakeEvent(this.element, 'input');
      }
    }
    await this._stabilize();
  }

  async text(): Promise<string> {
    await this._stabilize();
    return this.element.textContent || '';
  }

  async getAttribute(name: string): Promise<string|null> {
    await this._stabilize();
    let value = this.element.getAttribute(name);
    // If cannot find attribute in the element, also try to find it in property,
    // this is useful for input/textarea tags.
    if (value === null && name in this.element) {
      // We need to cast the element so we can access its properties via string indexing.
      return (this.element as unknown as {[key: string]: string|null})[name];
    }
    return value;
  }

  private _isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
    return element.nodeName.toLowerCase() === 'input' ||
      element.nodeName.toLowerCase() === 'textarea' ;
  }
}


/**
 * Get an element based on the CSS selector and root element.
 * @param selector The CSS selector
 * @param root Search element under the root element. If options.global is set,
 *     root is ignored.
 * @param options Optional, extra searching options
 * @return When element is not present, return null if Options.allowNull is set
 * to true, throw an error if Options.allowNull is set to false; otherwise,
 * return the element
 */
function getElement(selector: string, root: Element, options?: QueryOptions): Element|null {
  const useGlobalRoot = options && options.global;
  const elem = (useGlobalRoot ? document : root).querySelector(selector);
  const allowNull = options !== undefined && options.allowNull !== undefined ?
      options.allowNull : undefined;
  if (elem === null) {
    if (allowNull) {
      return null;
    }
    throw Error('Cannot find element based on the CSS selector: ' + selector);
  }
  return elem;
}
