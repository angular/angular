/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The statement mode for the render, either as a class back-patch or as a partial class
 */
export const enum OutputMode {
  PartialClass,
  BackPatch,
}

/**
 * Comment to insert above back-patch
 */
export const BUILD_OPTIMIZER_COLOCATE = '@__BUILD_OPTIMIZER_COLOCATE__';

/**
 * Comment to mark removable expressions
 */
export const BUILD_OPTIMIZER_REMOVE = '@__BUILD_OPTIMIZER_REMOVE__';
