/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Special markers which can be left on `Type.__NG_ELEMENT_ID__` which are used by the Ivy's
 * `NodeInjector`. Usually these markers contain factory functions. But in case of this special
 * marker we can't leave behind a function because it would create tree shaking problem.
 *
 * Currently only `Injector` is special.
 *
 * NOTE: the numbers here must be negative, because positive numbers are used as IDs for bloom
 * filter.
 */
export const enum InjectorMarkers {
  /**
   * Marks that the current type is `Injector`
   */
  Injector = -1
}