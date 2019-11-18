/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Defines template and style encapsulation options available for Component's {@link View}.
 *
 * See {@link Component#encapsulation encapsulation}.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/ts/metadata/encapsulation.ts region='longform'}
 *
 * @publicApi
 */
export enum ViewEncapsulation {
  /**
   * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
   * Element and pre-processing the style rules provided via {@link Component#styles styles} or
   * {@link Component#styleUrls styleUrls}, and adding the new Host Element attribute to all
   * selectors.
   *
   * This is the default option.
   */
  Emulated = 0,
  /**
   * @deprecated v6.1.0 - use {ViewEncapsulation.ShadowDom} instead.
   * Use the native encapsulation mechanism of the renderer.
   *
   * For the DOM this means using the deprecated [Shadow DOM
   * v0](https://w3c.github.io/webcomponents/spec/shadow/) and
   * creating a ShadowRoot for Component's Host Element.
   */
  Native = 1,
  /**
   * Don't provide any template or style encapsulation.
   */
  None = 2,

  /**
   * Use Shadow DOM to encapsulate styles.
   *
   * For the DOM this means using modern [Shadow
   * DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
   * creating a ShadowRoot for Component's Host Element.
   */
  ShadowDom = 3
}
