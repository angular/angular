/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StylingContext} from '../interfaces/styling';

let stylingContext: StylingContext|null = null;

/**
 * Gets the most recent styling context value.
 *
 * Note that only one styling context is stored at a given time.
 */
export function getCachedStylingContext() {
  return stylingContext;
}

/**
 * Sets the most recent styling context value.
 *
 * Note that only one styling context is stored at a given time.
 *
 * @param context The styling context value that will be stored
 */
export function setCachedStylingContext(context: StylingContext | null) {
  stylingContext = context;
}
