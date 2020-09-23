/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as keyCodes from '@angular/cdk/keycodes';
import {
  _getTextWithExcludedElements,
  ElementDimensions,
  ModifierKeys,
  TestElement,
  TestKey,
  TextOptions
} from '@angular/cdk/testing';
import {
  clearElement,
  dispatchFakeEvent,
  dispatchMouseEvent,
  dispatchPointerEvent,
  isTextInput,
  triggerBlur,
  triggerFocus,
  typeInElement,
} from './fake-events';

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
    triggerBlur(this.element as HTMLElement);
    await this._stabilize();
  }

  async clear(): Promise<void> {
    if (!isTextInput(this.element)) {
      throw Error('Attempting to clear an invalid element');
    }
    clearElement(this.element);
    await this._stabilize();
  }

  async click(...args: [] | ['center'] | [number, number]): Promise<void> {
    let clientX: number | undefined = undefined;
    let clientY: number | undefined = undefined;
    if (args.length) {
      const {left, top, width, height} = await this.getDimensions();
      const relativeX = args[0] === 'center' ? width / 2 : args[0];
      const relativeY = args[0] === 'center' ? height / 2 : args[1];

      // Round the computed click position as decimal pixels are not
      // supported by mouse events and could lead to unexpected results.
      clientX = Math.round(left + relativeX);
      clientY = Math.round(top + relativeY);
    }

    this._dispatchPointerEventIfSupported('pointerdown', clientX, clientY);
    dispatchMouseEvent(this.element, 'mousedown', clientX, clientY);
    this._dispatchPointerEventIfSupported('pointerup', clientX, clientY);
    dispatchMouseEvent(this.element, 'mouseup', clientX, clientY);
    dispatchMouseEvent(this.element, 'click', clientX, clientY);
    await this._stabilize();
  }

  async focus(): Promise<void> {
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
    this._dispatchPointerEventIfSupported('pointerenter');
    dispatchMouseEvent(this.element, 'mouseenter');
    await this._stabilize();
  }

  async mouseAway(): Promise<void> {
    this._dispatchPointerEventIfSupported('pointerleave');
    dispatchMouseEvent(this.element, 'mouseleave');
    await this._stabilize();
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(...modifiersAndKeys: any[]): Promise<void> {
    const args = modifiersAndKeys.map(k => typeof k === 'number' ? keyMap[k as TestKey] : k);
    typeInElement(this.element as HTMLElement, ...args);
    await this._stabilize();
  }

  async text(options?: TextOptions): Promise<string> {
    await this._stabilize();
    if (options?.exclude) {
      return _getTextWithExcludedElements(this.element, options.exclude);
    }
    return (this.element.textContent || '').trim();
  }

  async getAttribute(name: string): Promise<string|null> {
    await this._stabilize();
    return this.element.getAttribute(name);
  }

  async hasClass(name: string): Promise<boolean> {
    await this._stabilize();
    return this.element.classList.contains(name);
  }

  async getDimensions(): Promise<ElementDimensions> {
    await this._stabilize();
    return this.element.getBoundingClientRect();
  }

  async getProperty(name: string): Promise<any> {
    await this._stabilize();
    return (this.element as any)[name];
  }

  async setInputValue(value: string): Promise<void> {
    (this.element as any).value = value;
    await this._stabilize();
  }

  async selectOptions(...optionIndexes: number[]): Promise<void> {
    let hasChanged = false;
    const options = this.element.querySelectorAll('option');
    const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const wasSelected = option.selected;

      // We have to go through `option.selected`, because `HTMLSelectElement.value` doesn't
      // allow for multiple options to be selected, even in `multiple` mode.
      option.selected = indexes.has(i);

      if (option.selected !== wasSelected) {
        hasChanged = true;
        dispatchFakeEvent(this.element, 'change');
      }
    }

    if (hasChanged) {
      await this._stabilize();
    }
  }

  async matchesSelector(selector: string): Promise<boolean> {
    await this._stabilize();
    const elementPrototype = Element.prototype as any;
    return (elementPrototype['matches'] || elementPrototype['msMatchesSelector'])
        .call(this.element, selector);
  }

  async isFocused(): Promise<boolean> {
    await this._stabilize();
    return document.activeElement === this.element;
  }

  /**
   * Dispatches a pointer event on the current element if the browser supports it.
   * @param name Name of the pointer event to be dispatched.
   * @param clientX Coordinate of the user's pointer along the X axis.
   * @param clientY Coordinate of the user's pointer along the Y axis.
   */
  private _dispatchPointerEventIfSupported(name: string, clientX?: number, clientY?: number) {
    // The latest versions of all browsers we support have the new `PointerEvent` API.
    // Though since we capture the two most recent versions of these browsers, we also
    // need to support Safari 12 at time of writing. Safari 12 does not have support for this,
    // so we need to conditionally create and dispatch these events based on feature detection.
    if (typeof PointerEvent !== 'undefined' && PointerEvent) {
      dispatchPointerEvent(this.element, name, clientX, clientY);
    }
  }
}
