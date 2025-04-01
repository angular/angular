/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';

import {getComponentDef} from './def_getters';
import {getDeclarationComponentDef} from './instructions/element_validation';
import {TNode} from './interfaces/node';
import {LView, TVIEW} from './interfaces/view';
import {INTERPOLATION_DELIMITER} from './util/misc_utils';
import {stringifyForError} from './util/stringify_utils';

/**
 * The max length of the string representation of a value in an error message
 */
const VALUE_STRING_LENGTH_LIMIT = 200;

/** Verifies that a given type is a Standalone Component. */
export function assertStandaloneComponentType(type: Type<unknown>) {
  assertComponentDef(type);
  const componentDef = getComponentDef(type)!;
  if (!componentDef.standalone) {
    throw new RuntimeError(
      RuntimeErrorCode.TYPE_IS_NOT_STANDALONE,
      `The ${stringifyForError(type)} component is not marked as standalone, ` +
        `but Angular expects to have a standalone component here. ` +
        `Please make sure the ${stringifyForError(type)} component has ` +
        `the \`standalone: true\` flag in the decorator.`,
    );
  }
}

/** Verifies whether a given type is a component */
export function assertComponentDef(type: Type<unknown>) {
  if (!getComponentDef(type)) {
    throw new RuntimeError(
      RuntimeErrorCode.MISSING_GENERATED_DEF,
      `The ${stringifyForError(type)} is not an Angular component, ` +
        `make sure it has the \`@Component\` decorator.`,
    );
  }
}

/** Called when there are multiple component selectors that match a given node */
export function throwMultipleComponentError(
  tNode: TNode,
  first: Type<unknown>,
  second: Type<unknown>,
): never {
  throw new RuntimeError(
    RuntimeErrorCode.MULTIPLE_COMPONENTS_MATCH,
    `Multiple components match node with tagname ${tNode.value}: ` +
      `${stringifyForError(first)} and ` +
      `${stringifyForError(second)}`,
  );
}

/** Throws an ExpressionChangedAfterChecked error if checkNoChanges mode is on. */
export function throwErrorIfNoChangesMode(
  creationMode: boolean,
  oldValue: any,
  currValue: any,
  propName: string | undefined,
  lView: LView,
): never {
  const hostComponentDef = getDeclarationComponentDef(lView);
  const componentClassName = hostComponentDef?.type?.name;
  const field = propName ? ` for '${propName}'` : '';
  let msg = `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value${field}: '${formatValue(
    oldValue,
  )}'. Current value: '${formatValue(currValue)}'.${
    componentClassName ? ` Expression location: ${componentClassName} component` : ''
  }`;
  if (creationMode) {
    msg +=
      ` It seems like the view has been created after its parent and its children have been dirty checked.` +
      ` Has it been created in a change detection hook?`;
  }
  throw new RuntimeError(RuntimeErrorCode.EXPRESSION_CHANGED_AFTER_CHECKED, msg);
}

function formatValue(value: unknown): string {
  let strValue: string = String(value);

  // JSON.stringify will throw on circular references
  try {
    if (Array.isArray(value) || strValue === '[object Object]') {
      strValue = JSON.stringify(value);
    }
  } catch (error) {}
  return strValue.length > VALUE_STRING_LENGTH_LIMIT
    ? strValue.substring(0, VALUE_STRING_LENGTH_LIMIT) + '…'
    : strValue;
}

function constructDetailsForInterpolation(
  lView: LView,
  rootIndex: number,
  expressionIndex: number,
  meta: string,
  changedValue: any,
) {
  const [propName, prefix, ...chunks] = meta.split(INTERPOLATION_DELIMITER);
  let oldValue = prefix,
    newValue = prefix;
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
  lView: LView,
  bindingIndex: number,
  oldValue: any,
  newValue: any,
): {propName?: string; oldValue: any; newValue: any} {
  const tData = lView[TVIEW].data;
  const metadata = tData[bindingIndex];

  if (typeof metadata === 'string') {
    // metadata for property interpolation
    if (metadata.indexOf(INTERPOLATION_DELIMITER) > -1) {
      return constructDetailsForInterpolation(
        lView,
        bindingIndex,
        bindingIndex,
        metadata,
        newValue,
      );
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
      if (matches && matches.length - 1 > bindingIndex - idx) {
        return constructDetailsForInterpolation(lView, idx, bindingIndex, meta, newValue);
      }
    }
  }
  return {propName: undefined, oldValue, newValue};
}
