/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {copyParsedValue} from '../parser';
/**
 * Calculate the next `CssPropertyValue` based on the source and a target one.
 *
 * @param srcValue The source value
 * @param targetValue The target values (it's either the final or the initial value)
 * @param changeRate The change rate relative to the target (i.e. 1 = target value; 0 = source value)
 * @returns The newly generated value
 */
export function calculateNextCssValue(srcValue, targetValue, changeRate) {
  switch (targetValue.type) {
    case 'numeric':
      return calculateNextNumericValue(srcValue, targetValue, changeRate);
    case 'transform':
      return calculateNextTransformValue(srcValue, targetValue, changeRate);
    case 'color':
      return calculateNextColorValue(srcValue, targetValue, changeRate);
  }
  // Should represent static values
  return copyParsedValue(targetValue);
}
function calculateNextNumericValue(srcValue, targetValue, changeRate) {
  const nextValue = {
    type: 'numeric',
    values: [],
  };
  for (let i = 0; i < targetValue.values.length; i++) {
    const src = srcValue.values[i];
    const target = targetValue.values[i];
    const numDelta = calculateValueDelta(src[0], target[0], changeRate);
    // We should check both src and target for the unit
    // since we might have zero-based value without a unit
    // (e.g. 0 <-> 640px)
    const unit = target[1] || src[1];
    nextValue.values.push([src[0] + numDelta, unit]);
  }
  return nextValue;
}
function calculateNextTransformValue(srcValue, targetValue, changeRate) {
  const nextValue = {
    type: 'transform',
    values: new Map(),
  };
  for (const [func, numData] of targetValue.values) {
    const srcNumData = srcValue.values.get(func);
    const newNumData = [];
    for (let i = 0; i < numData.length; i++) {
      const target = numData[i];
      const src = srcNumData[i];
      const numDelta = calculateValueDelta(src[0], target[0], changeRate);
      // We should check both source and target for the unit
      // since we might have zero-based value without a unit
      // (e.g. rotate(0) <-> rotate(180deg))
      const unit = target[1] || src[1];
      newNumData.push([src[0] + numDelta, unit]);
    }
    nextValue.values.set(func, newNumData);
  }
  return nextValue;
}
function calculateNextColorValue(srcValue, targetValue, changeRate) {
  const nextColor = [srcValue.value[0]];
  // Skip the first element since it represents the type.
  for (let i = 1; i < targetValue.value.length; i++) {
    const srcChannel = srcValue.value[i];
    const targetChannel = targetValue.value[i];
    const delta = calculateValueDelta(srcChannel, targetChannel, changeRate);
    nextColor.push(Math.round(srcChannel + delta));
  }
  return {
    type: 'color',
    value: nextColor,
  };
}
function calculateValueDelta(srcValue, targetValue, changeRate) {
  const valueSpan = targetValue - srcValue;
  return valueSpan * changeRate;
}
//# sourceMappingURL=calc-css-value.js.map
