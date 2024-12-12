/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Defines the CSS styles encapsulation policies for the {@link /api/core/Component Component} decorator's
 * `encapsulation` option.
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
  // TODO: consider making `ViewEncapsulation` a `const enum` instead. See
  // https://github.com/angular/angular/issues/44119 for additional information.

  /**
   * Emulates a native Shadow DOM encapsulation behavior by adding a specific attribute to the
   * component's host element and applying the same attribute to all the CSS selectors provided
   * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls}.
   *
   * This is the default option.
   */
  Emulated = 0,

  // Historically the 1 value was for `Native` encapsulation which has been removed as of v11.

  /**
   * Doesn't provide any sort of CSS style encapsulation, meaning that all the styles provided
   * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls} are applicable
   * to any HTML element of the application regardless of their host Component.
   */
  None = 2,

  /**
   * Uses the browser's native Shadow DOM API to encapsulate CSS styles, meaning that it creates
   * a ShadowRoot for the component's host element which is then used to encapsulate
   * all the Component's styling.
   */
  ShadowDom = 3,
}
