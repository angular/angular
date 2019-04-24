/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertLessThan} from '../../util/assert';
import {bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4} from '../bindings';
import {BINDING_INDEX, TVIEW} from '../interfaces/view';
import {getLView} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/misc_utils';

import {storeBindingMetadata} from './shared';



/**
 * Create interpolation bindings with a variable number of expressions.
 *
 * If there are 1 to 8 expressions `interpolation1()` to `interpolation8()` should be used instead.
 * Those are faster because there is no need to create an array of expressions and iterate over it.
 *
 * `values`:
 * - has static text at even indexes,
 * - has evaluated expressions at odd indexes.
 *
 * Returns the concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 *
 * @codeGenApi
 */
export function ɵɵinterpolationV(values: any[]): string|NO_CHANGE {
  ngDevMode && assertLessThan(2, values.length, 'should have at least 3 values');
  ngDevMode && assertEqual(values.length % 2, 1, 'should have an odd number of values');
  let isBindingUpdated = false;
  const lView = getLView();
  const tData = lView[TVIEW].data;
  let bindingIndex = lView[BINDING_INDEX];

  if (tData[bindingIndex] == null) {
    // 2 is the index of the first static interstitial value (ie. not prefix)
    for (let i = 2; i < values.length; i += 2) {
      tData[bindingIndex++] = values[i];
    }
    bindingIndex = lView[BINDING_INDEX];
  }

  for (let i = 1; i < values.length; i += 2) {
    // Check if bindings (odd indexes) have changed
    isBindingUpdated = bindingUpdated(lView, bindingIndex++, values[i]) || isBindingUpdated;
  }
  lView[BINDING_INDEX] = bindingIndex;
  storeBindingMetadata(lView, values[0], values[values.length - 1]);

  if (!isBindingUpdated) {
    return NO_CHANGE;
  }

  // Build the updated content
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += renderStringify(values[i]) + values[i + 1];
  }

  return content;
}

/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation1(prefix: string, v0: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const different = bindingUpdated(lView, lView[BINDING_INDEX]++, v0);
  storeBindingMetadata(lView, prefix, suffix);
  return different ? prefix + renderStringify(v0) + suffix : NO_CHANGE;
}

/**
 * Creates an interpolation binding with 2 expressions.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation2(
    prefix: string, v0: any, i0: string, v1: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  const different = bindingUpdated2(lView, bindingIndex, v0, v1);
  lView[BINDING_INDEX] += 2;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    lView[TVIEW].data[bindingIndex] = i0;
  }

  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + suffix : NO_CHANGE;
}

/**
 * Creates an interpolation binding with 3 expressions.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation3(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string|
    NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  const different = bindingUpdated3(lView, bindingIndex, v0, v1, v2);
  lView[BINDING_INDEX] += 3;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + suffix :
      NO_CHANGE;
}

/**
 * Create an interpolation binding with 4 expressions.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation4(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  const different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  lView[BINDING_INDEX] += 4;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 5 expressions.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation5(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated(lView, bindingIndex + 4, v4) || different;
  lView[BINDING_INDEX] += 5;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 6 expressions.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation6(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated2(lView, bindingIndex + 4, v4, v5) || different;
  lView[BINDING_INDEX] += 6;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
    tData[bindingIndex + 4] = i4;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 7 expressions.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation7(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string|
    NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated3(lView, bindingIndex + 4, v4, v5, v6) || different;
  lView[BINDING_INDEX] += 7;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
    tData[bindingIndex + 4] = i4;
    tData[bindingIndex + 5] = i5;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 +
          renderStringify(v6) + suffix :
      NO_CHANGE;
}

/**
 * Creates an interpolation binding with 8 expressions.
 *
 * @codeGenApi
 */
export function ɵɵinterpolation8(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any,
    suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated4(lView, bindingIndex + 4, v4, v5, v6, v7) || different;
  lView[BINDING_INDEX] += 8;

  // Only set static strings the first time (data will be null subsequent runs).
  const data = storeBindingMetadata(lView, prefix, suffix);
  if (data) {
    const tData = lView[TVIEW].data;
    tData[bindingIndex] = i0;
    tData[bindingIndex + 1] = i1;
    tData[bindingIndex + 2] = i2;
    tData[bindingIndex + 3] = i3;
    tData[bindingIndex + 4] = i4;
    tData[bindingIndex + 5] = i5;
    tData[bindingIndex + 6] = i6;
  }

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 +
          renderStringify(v6) + i6 + renderStringify(v7) + suffix :
      NO_CHANGE;
}
