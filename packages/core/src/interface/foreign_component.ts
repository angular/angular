/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Represents a component from another framework.
 *
 * @publicApi
 */
export interface ForeignComponent {
  /**
   * A function that renders this component.
   */
  ɵrender: Function;
}
