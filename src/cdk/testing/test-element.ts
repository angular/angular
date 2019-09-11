/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementDimensions} from './element-dimensions';
import {ModifierKeys} from './event-objects';

/** An enum of non-text keys that can be used with the `sendKeys` method. */
// NOTE: This is a separate enum from `@angular/cdk/keycodes` because we don't necessarily want to
// support every possible keyCode. We also can't rely on Protractor's `Key` because we don't want a
// dependency on any particular testing framework here. Instead we'll just maintain this supported
// list of keys and let individual concrete `HarnessEnvironment` classes map them to whatever key
// representation is used in its respective testing framework.
export enum TestKey {
  BACKSPACE,
  TAB,
  ENTER,
  SHIFT,
  CONTROL,
  ALT,
  ESCAPE,
  PAGE_UP,
  PAGE_DOWN,
  END,
  HOME,
  LEFT_ARROW,
  UP_ARROW,
  RIGHT_ARROW,
  DOWN_ARROW,
  INSERT,
  DELETE,
  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
  F11,
  F12,
  META
}

/**
 * This acts as a common interface for DOM elements across both unit and e2e tests. It is the
 * interface through which the ComponentHarness interacts with the component's DOM.
 */
export interface TestElement {
  /** Blur the element. */
  blur(): Promise<void>;

  /** Clear the element's input (for input elements only). */
  clear(): Promise<void>;

  /**
   * Click the element.
   * @param relativeX Coordinate within the element, along the X-axis at which to click.
   * @param relativeY Coordinate within the element, along the Y-axis at which to click.
   */
  click(relativeX?: number, relativeY?: number): Promise<void>;

  /** Focus the element. */
  focus(): Promise<void>;

  /** Get the computed value of the given CSS property for the element. */
  getCssValue(property: string): Promise<string>;

  /** Hovers the mouse over the element. */
  hover(): Promise<void>;

  /**
   * Sends the given string to the input as a series of key presses. Also fires input events
   * and attempts to add the string to the Element's value.
   */
  sendKeys(...keys: (string | TestKey)[]): Promise<void>;

  /**
   * Sends the given string to the input as a series of key presses. Also fires input events
   * and attempts to add the string to the Element's value.
   */
  sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;

  /** Gets the text from the element. */
  text(): Promise<string>;

  /** Gets the value for the given attribute from the element. */
  getAttribute(name: string): Promise<string | null>;

  /** Checks whether the element has the given class. */
  hasClass(name: string): Promise<boolean>;

  /** Gets the dimensions of the element. */
  getDimensions(): Promise<ElementDimensions>;

  /** Gets the value of a property of an element. */
  getProperty(name: string): Promise<any>;

  /** Checks whether this element matches the given selector. */
  matchesSelector(selector: string): Promise<boolean>;

  /**
   * Flushes change detection and async tasks.
   * In most cases it should not be necessary to call this. However, there may be some edge cases
   * where it is needed to fully flush animation events.
   */
  forceStabilize(): Promise<void>;
}
