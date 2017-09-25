/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Defines template and style encapsulation options available for Component's {@link Component}.
 *
 * See {@link Component#encapsulation}.
 * @stable
 */
export enum ViewEncapsulation {
  /**
   * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
   * Element and pre-processing the style rules provided via
   * {@link Component#styles} or {@link Component#styleUrls}, and adding the new Host Element
   * attribute to all selectors.
   *
   * This is the default option.
   */
  Emulated = 0,
  /**
   * Use the native encapsulation mechanism of the renderer.
   *
   * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
   * creating a ShadowRoot for Component's Host Element.
   */
  Native = 1,
  /**
   * Don't provide any template or style encapsulation.
   */
  None = 2
}
