/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementDimensions} from './element-dimensions';

/** Modifier keys that may be held while typing. */
export interface ModifierKeys {
  control?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

/** Data that can be attached to a custom event dispatched from a `TestElement`. */
export type EventData =
  | string
  | number
  | boolean
  | undefined
  | null
  | EventData[]
  | {[key: string]: EventData};

/** An enum of non-text keys that can be used with the `sendKeys` method. */
// NOTE: This is a separate enum from `@angular/cdk/keycodes` because we don't necessarily want to
// support every possible keyCode. We also can't rely on Protractor's `Key` because we don't want a
// dependency on any particular testing framework here. Instead we'll just maintain this supported
// list of keys and let individual concrete `HarnessEnvironment` classes map them to whatever key
// representation is used in its respective testing framework.
// tslint:disable-next-line:prefer-const-enum Seems like this causes some issues with System.js
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
  META,
}

/**
 * This acts as a common interface for DOM elements across both unit and e2e tests. It is the
 * interface through which the ComponentHarness interacts with the component's DOM.
 */
export interface TestElement {
  /** Blur the element. */
  blur(): Promise<void>;

  /** Clear the element's input (for input and textarea elements only). */
  clear(): Promise<void>;

  /**
   * Click the element at the default location for the current environment. If you need to guarantee
   * the element is clicked at a specific location, consider using `click('center')` or
   * `click(x, y)` instead.
   */
  click(modifiers?: ModifierKeys): Promise<void>;

  /** Click the element at the element's center. */
  click(location: 'center', modifiers?: ModifierKeys): Promise<void>;

  /**
   * Click the element at the specified coordinates relative to the top-left of the element.
   * @param relativeX Coordinate within the element, along the X-axis at which to click.
   * @param relativeY Coordinate within the element, along the Y-axis at which to click.
   * @param modifiers Modifier keys held while clicking
   */
  click(relativeX: number, relativeY: number, modifiers?: ModifierKeys): Promise<void>;

  /**
   * Right clicks on the element at the specified coordinates relative to the top-left of it.
   * @param relativeX Coordinate within the element, along the X-axis at which to click.
   * @param relativeY Coordinate within the element, along the Y-axis at which to click.
   * @param modifiers Modifier keys held while clicking
   */
  rightClick(relativeX: number, relativeY: number, modifiers?: ModifierKeys): Promise<void>;

  /** Focus the element. */
  focus(): Promise<void>;

  /** Get the computed value of the given CSS property for the element. */
  getCssValue(property: string): Promise<string>;

  /** Hovers the mouse over the element. */
  hover(): Promise<void>;

  /** Moves the mouse away from the element. */
  mouseAway(): Promise<void>;

  /**
   * Sends the given string to the input as a series of key presses. Also fires input events
   * and attempts to add the string to the Element's value. Note that some environments cannot
   * reproduce native browser behavior for keyboard shortcuts such as Tab, Ctrl + A, etc.
   * @throws An error if no keys have been specified.
   */
  sendKeys(...keys: (string | TestKey)[]): Promise<void>;

  /**
   * Sends the given string to the input as a series of key presses. Also fires input
   * events and attempts to add the string to the Element's value.
   * @throws An error if no keys have been specified.
   */
  sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;

  /**
   * Gets the text from the element.
   * @param options Options that affect what text is included.
   */
  text(options?: TextOptions): Promise<string>;

  /** Gets the value for the given attribute from the element. */
  getAttribute(name: string): Promise<string | null>;

  /** Checks whether the element has the given class. */
  hasClass(name: string): Promise<boolean>;

  /** Gets the dimensions of the element. */
  getDimensions(): Promise<ElementDimensions>;

  /** Gets the value of a property of an element. */
  getProperty<T = any>(name: string): Promise<T>;

  /** Checks whether this element matches the given selector. */
  matchesSelector(selector: string): Promise<boolean>;

  /** Checks whether the element is focused. */
  isFocused(): Promise<boolean>;

  /** Sets the value of a property of an input. */
  setInputValue(value: string): Promise<void>;

  // Note that ideally here we'd be selecting options based on their value, rather than their
  // index, but we're limited by `@angular/forms` which will modify the option value in some cases.
  // Since the value will be truncated, we can't rely on it to do the lookup in the DOM. See:
  // https://github.com/angular/angular/blob/main/packages/forms/src/directives/select_control_value_accessor.ts#L19
  /** Selects the options at the specified indexes inside of a native `select` element. */
  selectOptions(...optionIndexes: number[]): Promise<void>;

  /**
   * Dispatches an event with a particular name.
   * @param name Name of the event to be dispatched.
   */
  dispatchEvent(name: string, data?: Record<string, EventData>): Promise<void>;
}

export interface TextOptions {
  /** Optional selector for elements to exclude. */
  exclude?: string;
}
