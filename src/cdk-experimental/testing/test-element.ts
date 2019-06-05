/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This acts as a common interface for DOM elements across both unit and e2e tests. It is the
 * interface through which the ComponentHarness interacts with the component's DOM.
 */
export interface TestElement {
  /** Blur the element. */
  blur(): Promise<void>;

  /** Clear the element's input (for input elements only). */
  clear(): Promise<void>;

  /** Click the element. */
  click(): Promise<void>;

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
  sendKeys(keys: string): Promise<void>;

  /** Gets the text from the element. */
  text(): Promise<string>;

  /**
   * Gets the value for the given attribute from the element. If the attribute does not exist,
   * falls back to reading the property.
   */
  getAttribute(name: string): Promise<string | null>;
}
