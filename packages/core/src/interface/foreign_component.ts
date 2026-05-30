/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Symbol used to store and retrieve the render function for a foreign component. */
export const RENDER: unique symbol = Symbol('RENDER');

/**
 * Represents a component from another framework that Angular can import and render.
 */
export interface ForeignComponent {
  readonly [RENDER]: Function;
}
