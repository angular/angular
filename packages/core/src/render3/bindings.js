/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertIndexInRange, assertLessThan, assertNotSame} from '../util/assert';
import {devModeEqual} from '../util/comparison';
import {getExpressionChangedErrorDetails, throwErrorIfNoChangesMode} from './errors';
import {isInCheckNoChangesMode} from './state';
import {NO_CHANGE} from './tokens';
// TODO(misko): consider inlining
/** Updates binding and returns the value. */
export function updateBinding(lView, bindingIndex, value) {
  return (lView[bindingIndex] = value);
}
/** Gets the current binding value. */
export function getBinding(lView, bindingIndex) {
  ngDevMode && assertIndexInRange(lView, bindingIndex);
  ngDevMode &&
    assertNotSame(lView[bindingIndex], NO_CHANGE, 'Stored value should never be NO_CHANGE.');
  return lView[bindingIndex];
}
/**
 * Updates binding if changed, then returns whether it was updated.
 *
 * This function also checks the `CheckNoChangesMode` and throws if changes are made.
 * Some changes (Objects/iterables) during `CheckNoChangesMode` are exempt to comply with VE
 * behavior.
 *
 * @param lView current `LView`
 * @param bindingIndex The binding in the `LView` to check
 * @param value New value to check against `lView[bindingIndex]`
 * @returns `true` if the bindings has changed. (Throws if binding has changed during
 *          `CheckNoChangesMode`)
 */
export function bindingUpdated(lView, bindingIndex, value) {
  ngDevMode &&
    assertLessThan(bindingIndex, lView.length, `Slot should have been initialized to NO_CHANGE`);
  if (value === NO_CHANGE) {
    return false;
  }
  const oldValue = lView[bindingIndex];
  if (Object.is(oldValue, value)) {
    return false;
  } else {
    if (ngDevMode && isInCheckNoChangesMode()) {
      // View engine didn't report undefined values as changed on the first checkNoChanges pass
      // (before the change detection was run).
      const oldValueToCompare = oldValue !== NO_CHANGE ? oldValue : undefined;
      if (!devModeEqual(oldValueToCompare, value)) {
        const details = getExpressionChangedErrorDetails(
          lView,
          bindingIndex,
          oldValueToCompare,
          value,
        );
        throwErrorIfNoChangesMode(
          oldValue === NO_CHANGE,
          details.oldValue,
          details.newValue,
          details.propName,
          lView,
        );
      }
      // There was a change, but the `devModeEqual` decided that the change is exempt from an error.
      // For this reason we exit as if no change. The early exit is needed to prevent the changed
      // value to be written into `LView` (If we would write the new value that we would not see it
      // as change on next CD.)
      return false;
    }
    lView[bindingIndex] = value;
    return true;
  }
}
/** Updates 2 bindings if changed, then returns whether either was updated. */
export function bindingUpdated2(lView, bindingIndex, exp1, exp2) {
  const different = bindingUpdated(lView, bindingIndex, exp1);
  return bindingUpdated(lView, bindingIndex + 1, exp2) || different;
}
/** Updates 3 bindings if changed, then returns whether any was updated. */
export function bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3) {
  const different = bindingUpdated2(lView, bindingIndex, exp1, exp2);
  return bindingUpdated(lView, bindingIndex + 2, exp3) || different;
}
/** Updates 4 bindings if changed, then returns whether any was updated. */
export function bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4) {
  const different = bindingUpdated2(lView, bindingIndex, exp1, exp2);
  return bindingUpdated2(lView, bindingIndex + 2, exp3, exp4) || different;
}
//# sourceMappingURL=bindings.js.map
