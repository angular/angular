/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys} from '@angular/cdk/testing';
import {browser, ElementFinder, Key} from 'protractor';
import {ElementDimensions} from '../element-dimensions';
import {TestElement, TestKey} from '../test-element';

/** Maps the `TestKey` constants to Protractor's `Key` constants. */
const keyMap = {
  [TestKey.BACKSPACE]: Key.BACK_SPACE,
  [TestKey.TAB]: Key.TAB,
  [TestKey.ENTER]: Key.ENTER,
  [TestKey.SHIFT]: Key.SHIFT,
  [TestKey.CONTROL]: Key.CONTROL,
  [TestKey.ALT]: Key.ALT,
  [TestKey.ESCAPE]: Key.ESCAPE,
  [TestKey.PAGE_UP]: Key.PAGE_UP,
  [TestKey.PAGE_DOWN]: Key.PAGE_DOWN,
  [TestKey.END]: Key.END,
  [TestKey.HOME]: Key.HOME,
  [TestKey.LEFT_ARROW]: Key.ARROW_LEFT,
  [TestKey.UP_ARROW]: Key.ARROW_UP,
  [TestKey.RIGHT_ARROW]: Key.ARROW_RIGHT,
  [TestKey.DOWN_ARROW]: Key.ARROW_DOWN,
  [TestKey.INSERT]: Key.INSERT,
  [TestKey.DELETE]: Key.DELETE,
  [TestKey.F1]: Key.F1,
  [TestKey.F2]: Key.F2,
  [TestKey.F3]: Key.F3,
  [TestKey.F4]: Key.F4,
  [TestKey.F5]: Key.F5,
  [TestKey.F6]: Key.F6,
  [TestKey.F7]: Key.F7,
  [TestKey.F8]: Key.F8,
  [TestKey.F9]: Key.F9,
  [TestKey.F10]: Key.F10,
  [TestKey.F11]: Key.F11,
  [TestKey.F12]: Key.F12,
  [TestKey.META]: Key.META
};

/** Converts a `ModifierKeys` object to a list of Protractor `Key`s. */
function toProtractorModifierKeys(modifiers: ModifierKeys): string[] {
  const result: string[] = [];
  if (modifiers.control) {
    result.push(Key.CONTROL);
  }
  if (modifiers.alt) {
    result.push(Key.ALT);
  }
  if (modifiers.shift) {
    result.push(Key.SHIFT);
  }
  if (modifiers.meta) {
    result.push(Key.META);
  }
  return result;
}

/** A `TestElement` implementation for Protractor. */
export class ProtractorElement implements TestElement {
  constructor(readonly element: ElementFinder) {}

  async blur(): Promise<void> {
    return browser.executeScript('arguments[0].blur()', this.element);
  }

  async clear(): Promise<void> {
    return this.element.clear();
  }

  async click(relativeX = 0, relativeY = 0): Promise<void> {
    await browser.actions()
      .mouseMove(await this.element.getWebElement(), {x: relativeX, y: relativeY})
      .click()
      .perform();
  }

  async focus(): Promise<void> {
    return browser.executeScript('arguments[0].focus()', this.element);
  }

  async getCssValue(property: string): Promise<string> {
    return this.element.getCssValue(property);
  }

  async hover(): Promise<void> {
    return browser.actions()
        .mouseMove(await this.element.getWebElement())
        .perform();
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(...modifiersAndKeys: any[]): Promise<void> {
    const first = modifiersAndKeys[0];
    let modifiers: ModifierKeys;
    let rest: (string | TestKey)[];
    if (typeof first !== 'string' && typeof first !== 'number') {
      modifiers = first;
      rest = modifiersAndKeys.slice(1);
    } else {
      modifiers = {};
      rest = modifiersAndKeys;
    }

    const modifierKeys = toProtractorModifierKeys(modifiers);
    const keys = rest.map(k => typeof k === 'string' ? k.split('') : [keyMap[k]])
        .reduce((arr, k) => arr.concat(k), [])
        .map(k => Key.chord(...modifierKeys, k));

    return this.element.sendKeys(...keys);
  }

  async text(): Promise<string> {
    return this.element.getText();
  }

  async getAttribute(name: string): Promise<string|null> {
    return this.element.getAttribute(name);
  }

  async hasClass(name: string): Promise<boolean> {
    const classes = (await this.getAttribute('class')) || '';
    return new Set(classes.split(/\s+/).filter(c => c)).has(name);
  }

  async getDimensions(): Promise<ElementDimensions> {
    const {width, height} = await this.element.getSize();
    const {x: left, y: top} = await this.element.getLocation();
    return {width, height, left, top};
  }
}
