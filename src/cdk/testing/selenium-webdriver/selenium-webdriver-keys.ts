/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys, TestKey} from '@angular/cdk/testing';
import * as webdriver from 'selenium-webdriver';

/**
 * Maps the `TestKey` constants to WebDriver's `webdriver.Key` constants.
 * See https://github.com/SeleniumHQ/selenium/blob/trunk/javascript/webdriver/key.js#L29
 */
export const seleniumWebDriverKeyMap = {
  [TestKey.BACKSPACE]: webdriver.Key.BACK_SPACE,
  [TestKey.TAB]: webdriver.Key.TAB,
  [TestKey.ENTER]: webdriver.Key.ENTER,
  [TestKey.SHIFT]: webdriver.Key.SHIFT,
  [TestKey.CONTROL]: webdriver.Key.CONTROL,
  [TestKey.ALT]: webdriver.Key.ALT,
  [TestKey.ESCAPE]: webdriver.Key.ESCAPE,
  [TestKey.PAGE_UP]: webdriver.Key.PAGE_UP,
  [TestKey.PAGE_DOWN]: webdriver.Key.PAGE_DOWN,
  [TestKey.END]: webdriver.Key.END,
  [TestKey.HOME]: webdriver.Key.HOME,
  [TestKey.LEFT_ARROW]: webdriver.Key.ARROW_LEFT,
  [TestKey.UP_ARROW]: webdriver.Key.ARROW_UP,
  [TestKey.RIGHT_ARROW]: webdriver.Key.ARROW_RIGHT,
  [TestKey.DOWN_ARROW]: webdriver.Key.ARROW_DOWN,
  [TestKey.INSERT]: webdriver.Key.INSERT,
  [TestKey.DELETE]: webdriver.Key.DELETE,
  [TestKey.F1]: webdriver.Key.F1,
  [TestKey.F2]: webdriver.Key.F2,
  [TestKey.F3]: webdriver.Key.F3,
  [TestKey.F4]: webdriver.Key.F4,
  [TestKey.F5]: webdriver.Key.F5,
  [TestKey.F6]: webdriver.Key.F6,
  [TestKey.F7]: webdriver.Key.F7,
  [TestKey.F8]: webdriver.Key.F8,
  [TestKey.F9]: webdriver.Key.F9,
  [TestKey.F10]: webdriver.Key.F10,
  [TestKey.F11]: webdriver.Key.F11,
  [TestKey.F12]: webdriver.Key.F12,
  [TestKey.META]: webdriver.Key.META,
};

/** Gets a list of WebDriver `Key`s for the given `ModifierKeys`. */
export function getSeleniumWebDriverModifierKeys(modifiers: ModifierKeys): string[] {
  const result: string[] = [];
  if (modifiers.control) {
    result.push(webdriver.Key.CONTROL);
  }
  if (modifiers.alt) {
    result.push(webdriver.Key.ALT);
  }
  if (modifiers.shift) {
    result.push(webdriver.Key.SHIFT);
  }
  if (modifiers.meta) {
    result.push(webdriver.Key.META);
  }
  return result;
}
