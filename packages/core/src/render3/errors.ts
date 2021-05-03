
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RuntimeError, RuntimeErrorCode} from './error_code';
import {TNode} from './interfaces/node';
import {LView, TVIEW} from './interfaces/view';
import {INTERPOLATION_DELIMITER} from './util/misc_utils';



/** Called when there are multiple component selectors that match a given node */
export function throwMultipleComponentError(tNode: TNode): never {
  throw new RuntimeError(
      RuntimeErrorCode.MULTIPLE_COMPONENTS_MATCH,
      `Multiple components match node with tagname ${tNode.value}`);
}

/** Throws an ExpressionChangedAfterChecked error if checkNoChanges mode is on. */
export function throwErrorIfNoChangesMode(
    creationMode: boolean, oldValue: any, currValue: any, propName?: string): never {
  const field = propName ? ` for '${propName}'` : '';
  let msg =
      `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value${
          field}: '${oldValue}'. Current value: '${currValue}'.`;
  if (creationMode) {
    msg +=
        ` It seems like the view has been created after its parent and its children have been dirty checked.` +
        ` Has it been created in a change detection hook?`;
  }
  // TODO: include debug context, see `viewDebugError` function in
  // `packages/core/src/view/errors.ts` for reference.
  throw new RuntimeError(RuntimeErrorCode.EXPRESSION_CHANGED_AFTER_CHECKED, msg);
}

function constructDetailsForInterpolation(
    lView: LView, rootIndex: number, expressionIndex: number, meta: string, changedValue: any) {
  const [propName, prefix, ...chunks] = meta.split(INTERPOLATION_DELIMITER);
  let oldValue = prefix, newValue = prefix;
  for (let i = 0; i < chunks.length; i++) {
    const slotIdx = rootIndex + i;
    oldValue += `${lView[slotIdx]}${chunks[i]}`;
    newValue += `${slotIdx === expressionIndex ? changedValue : lView[slotIdx]}${chunks[i]}`;
  }
  return {propName, oldValue, newValue};
}

/**
 * Constructs an object that contains details for the ExpressionChangedAfterItHasBeenCheckedError:
 * - property name (for property bindings or interpolations)
 * - old and new values, enriched using information from metadata
 *
 * More information on the metadata storage format can be found in `storePropertyBindingMetadata`
 * function description.
 */
export function getExpressionChangedErrorDetails(
    lView: LView, bindingIndex: number, oldValue: any,
    newValue: any): {propName?: string, oldValue: any, newValue: any} {
  const tData = lView[TVIEW].data;
  const metadata = tData[bindingIndex];

  if (typeof metadata === 'string') {
    // metadata for property interpolation
    if (metadata.indexOf(INTERPOLATION_DELIMITER) > -1) {
      return constructDetailsForInterpolation(
          lView, bindingIndex, bindingIndex, metadata, newValue);
    }
    // metadata for property binding
    return {propName: metadata, oldValue, newValue};
  }

  // metadata is not available for this expression, check if this expression is a part of the
  // property interpolation by going from the current binding index left and look for a string that
  // contains INTERPOLATION_DELIMITER, the layout in tView.data for this case will look like this:
  // [..., 'id�Prefix � and � suffix', null, null, null, ...]
  if (metadata === null) {
    let idx = bindingIndex - 1;
    while (typeof tData[idx] !== 'string' && tData[idx + 1] === null) {
      idx--;
    }
    const meta = tData[idx];
    if (typeof meta === 'string') {
      const matches = meta.match(new RegExp(INTERPOLATION_DELIMITER, 'g'));
      // first interpolation delimiter separates property name from interpolation parts (in case of
      // property interpolations), so we subtract one from total number of found delimiters
      if (matches && (matches.length - 1) > bindingIndex - idx) {
        return constructDetailsForInterpolation(lView, idx, bindingIndex, meta, newValue);
      }
    }
  }
  return {propName: undefined, oldValue, newValue};
}
