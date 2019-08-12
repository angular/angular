/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as keyCodes from '@angular/cdk/keycodes';
import {
  clearElement,
  dispatchMouseEvent,
  isTextInput,
  ModifierKeys,
  triggerBlur,
  triggerFocus,
  typeInElement
} from '@angular/cdk/testing';
import {TestElement, TestKey} from '../test-element';

/** Maps `TestKey` constants to the `keyCode` and `key` values used by native browser events. */
const keyMap = {
  [TestKey.BACKSPACE]: {keyCode: keyCodes.BACKSPACE, key: 'Backspace'},
  [TestKey.TAB]: {keyCode: keyCodes.TAB, key: 'Tab'},
  [TestKey.ENTER]: {keyCode: keyCodes.ENTER, key: 'Enter'},
  [TestKey.SHIFT]: {keyCode: keyCodes.SHIFT, key: 'Shift'},
  [TestKey.CONTROL]: {keyCode: keyCodes.CONTROL, key: 'Control'},
  [TestKey.ALT]: {keyCode: keyCodes.ALT, key: 'Alt'},
  [TestKey.ESCAPE]: {keyCode: keyCodes.ESCAPE, key: 'Escape'},
  [TestKey.PAGE_UP]: {keyCode: keyCodes.PAGE_UP, key: 'PageUp'},
  [TestKey.PAGE_DOWN]: {keyCode: keyCodes.PAGE_DOWN, key: 'PageDown'},
  [TestKey.END]: {keyCode: keyCodes.END, key: 'End'},
  [TestKey.HOME]: {keyCode: keyCodes.HOME, key: 'Home'},
  [TestKey.LEFT_ARROW]: {keyCode: keyCodes.LEFT_ARROW, key: 'ArrowLeft'},
  [TestKey.UP_ARROW]: {keyCode: keyCodes.UP_ARROW, key: 'ArrowUp'},
  [TestKey.RIGHT_ARROW]: {keyCode: keyCodes.RIGHT_ARROW, key: 'ArrowRight'},
  [TestKey.DOWN_ARROW]: {keyCode: keyCodes.DOWN_ARROW, key: 'ArrowDown'},
  [TestKey.INSERT]: {keyCode: keyCodes.INSERT, key: 'Insert'},
  [TestKey.DELETE]: {keyCode: keyCodes.DELETE, key: 'Delete'},
  [TestKey.F1]: {keyCode: keyCodes.F1, key: 'F1'},
  [TestKey.F2]: {keyCode: keyCodes.F2, key: 'F2'},
  [TestKey.F3]: {keyCode: keyCodes.F3, key: 'F3'},
  [TestKey.F4]: {keyCode: keyCodes.F4, key: 'F4'},
  [TestKey.F5]: {keyCode: keyCodes.F5, key: 'F5'},
  [TestKey.F6]: {keyCode: keyCodes.F6, key: 'F6'},
  [TestKey.F7]: {keyCode: keyCodes.F7, key: 'F7'},
  [TestKey.F8]: {keyCode: keyCodes.F8, key: 'F8'},
  [TestKey.F9]: {keyCode: keyCodes.F9, key: 'F9'},
  [TestKey.F10]: {keyCode: keyCodes.F10, key: 'F10'},
  [TestKey.F11]: {keyCode: keyCodes.F11, key: 'F11'},
  [TestKey.F12]: {keyCode: keyCodes.F12, key: 'F12'},
  [TestKey.META]: {keyCode: keyCodes.META, key: 'Meta'}
};

/** A `TestElement` implementation for unit tests. */
export class UnitTestElement implements TestElement {
  constructor(readonly element: Element, private _stabilize: () => Promise<void>) {}

  async blur(): Promise<void> {
    await this._stabilize();
    triggerBlur(this.element as HTMLElement);
    await this._stabilize();
  }

  async clear(): Promise<void> {
    await this._stabilize();
    if (!isTextInput(this.element)) {
      throw Error('Attempting to clear an invalid element');
    }
    clearElement(this.element);
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

  async sendKeys(...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(...modifiersAndKeys: any[]): Promise<void> {
    await this._stabilize();
    const args = modifiersAndKeys.map(k => typeof k === 'number' ? keyMap[k as TestKey] : k);
    typeInElement(this.element as HTMLElement, ...args);
    await this._stabilize();
  }

  async text(): Promise<string> {
    await this._stabilize();
    return (this.element.textContent || '').trim();
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

  async hasClass(name: string): Promise<boolean> {
    await this._stabilize();
    return this.element.classList.contains(name);
  }
}
