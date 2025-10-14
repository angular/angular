/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertLessThan} from '../../util/assert';
import {bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4} from '../bindings';
import {getBindingIndex, incrementBindingIndex, nextBindingIndex, setBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/stringify_utils';
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
 */
export function interpolationV(lView, values) {
  ngDevMode && assertLessThan(2, values.length, 'should have at least 3 values');
  let isBindingUpdated = false;
  let bindingIndex = getBindingIndex();
  for (let i = 1; i < values.length; i += 2) {
    // Check if bindings (odd indexes) have changed
    isBindingUpdated = bindingUpdated(lView, bindingIndex++, values[i]) || isBindingUpdated;
  }
  setBindingIndex(bindingIndex);
  if (!isBindingUpdated) {
    return NO_CHANGE;
  }
  // Build the updated content
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    // The condition is to prevent an out-of-bound read
    content += renderStringify(values[i]) + (i + 1 !== values.length ? values[i + 1] : '');
  }
  return content;
}
/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 */
export function interpolation1(lView, prefix, v0, suffix = '') {
  const different = bindingUpdated(lView, nextBindingIndex(), v0);
  return different ? prefix + renderStringify(v0) + suffix : NO_CHANGE;
}
/**
 * Creates an interpolation binding with 2 expressions.
 */
export function interpolation2(lView, prefix, v0, i0, v1, suffix = '') {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated2(lView, bindingIndex, v0, v1);
  incrementBindingIndex(2);
  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + suffix : NO_CHANGE;
}
/**
 * Creates an interpolation binding with 3 expressions.
 */
export function interpolation3(lView, prefix, v0, i0, v1, i1, v2, suffix = '') {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated3(lView, bindingIndex, v0, v1, v2);
  incrementBindingIndex(3);
  return different
    ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + suffix
    : NO_CHANGE;
}
/**
 * Create an interpolation binding with 4 expressions.
 */
export function interpolation4(lView, prefix, v0, i0, v1, i1, v2, i2, v3, suffix = '') {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  incrementBindingIndex(4);
  return different
    ? prefix +
        renderStringify(v0) +
        i0 +
        renderStringify(v1) +
        i1 +
        renderStringify(v2) +
        i2 +
        renderStringify(v3) +
        suffix
    : NO_CHANGE;
}
/**
 * Creates an interpolation binding with 5 expressions.
 */
export function interpolation5(lView, prefix, v0, i0, v1, i1, v2, i2, v3, i3, v4, suffix = '') {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated(lView, bindingIndex + 4, v4) || different;
  incrementBindingIndex(5);
  return different
    ? prefix +
        renderStringify(v0) +
        i0 +
        renderStringify(v1) +
        i1 +
        renderStringify(v2) +
        i2 +
        renderStringify(v3) +
        i3 +
        renderStringify(v4) +
        suffix
    : NO_CHANGE;
}
/**
 * Creates an interpolation binding with 6 expressions.
 */
export function interpolation6(
  lView,
  prefix,
  v0,
  i0,
  v1,
  i1,
  v2,
  i2,
  v3,
  i3,
  v4,
  i4,
  v5,
  suffix = '',
) {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated2(lView, bindingIndex + 4, v4, v5) || different;
  incrementBindingIndex(6);
  return different
    ? prefix +
        renderStringify(v0) +
        i0 +
        renderStringify(v1) +
        i1 +
        renderStringify(v2) +
        i2 +
        renderStringify(v3) +
        i3 +
        renderStringify(v4) +
        i4 +
        renderStringify(v5) +
        suffix
    : NO_CHANGE;
}
/**
 * Creates an interpolation binding with 7 expressions.
 */
export function interpolation7(
  lView,
  prefix,
  v0,
  i0,
  v1,
  i1,
  v2,
  i2,
  v3,
  i3,
  v4,
  i4,
  v5,
  i5,
  v6,
  suffix = '',
) {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated3(lView, bindingIndex + 4, v4, v5, v6) || different;
  incrementBindingIndex(7);
  return different
    ? prefix +
        renderStringify(v0) +
        i0 +
        renderStringify(v1) +
        i1 +
        renderStringify(v2) +
        i2 +
        renderStringify(v3) +
        i3 +
        renderStringify(v4) +
        i4 +
        renderStringify(v5) +
        i5 +
        renderStringify(v6) +
        suffix
    : NO_CHANGE;
}
/**
 * Creates an interpolation binding with 8 expressions.
 */
export function interpolation8(
  lView,
  prefix,
  v0,
  i0,
  v1,
  i1,
  v2,
  i2,
  v3,
  i3,
  v4,
  i4,
  v5,
  i5,
  v6,
  i6,
  v7,
  suffix = '',
) {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated4(lView, bindingIndex + 4, v4, v5, v6, v7) || different;
  incrementBindingIndex(8);
  return different
    ? prefix +
        renderStringify(v0) +
        i0 +
        renderStringify(v1) +
        i1 +
        renderStringify(v2) +
        i2 +
        renderStringify(v3) +
        i3 +
        renderStringify(v4) +
        i4 +
        renderStringify(v5) +
        i5 +
        renderStringify(v6) +
        i6 +
        renderStringify(v7) +
        suffix
    : NO_CHANGE;
}
//# sourceMappingURL=interpolation.js.map
