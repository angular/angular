/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {TNode} from '../interfaces/node';
import {LStylingData} from '../interfaces/styling';
import {TData} from '../interfaces/view';
import {getBindingPropName, getConcatenatedValue, getNextBindingIndex, getPreviousBindingIndex, getStyleBindingSuffix, getStylingHead, getStylingTail, getValue, isComponentHostBinding, isDirectiveHostBinding, isHostBinding} from '../util/styling_utils';



/**
 * --------
 *
 * This file contains various debug-level utilities for styling in Angular.
 *
 * The debug-level utilities in this file are not included into the
 * `render3/util/styling_utils.ts` so that they do not interfere with
 * non-debugging utilities.
 *
 * They are also not included in `debug_styling.ts` because there would might
 * be a cyclic dependency if these utilities are used directly within source
 * code (Google3 might throw a build error).
 *
 * To learn more about the algorithm see `instructions/styling.ts`.
 *
 * --------
 */

/**
 * Used to print each of the style/class bindings attached to the given node.
 */
export function printStylingSources(tNode: TNode, tData: TData, isClassBased: boolean): void {
  let bindingIndex = getStylingHead(tNode, isClassBased);
  let hostBindingsMode = false;
  let isFirstItem = true;
  let str = '';
  while (bindingIndex !== 0) {
    if (!hostBindingsMode && isHostBinding(tData, bindingIndex)) {
      hostBindingsMode = true;
      isFirstItem = true;
    }
    if (isFirstItem) {
      if (hostBindingsMode) {
        str += '\n\nHOST BINDINGS:\n';
      } else {
        str += '\n\nTEMPLATE BINDINGS:\n';
      }
    }

    isFirstItem = false;
    const prop = getBindingPropName(tData, bindingIndex) || 'MAP';
    const suffix = getStyleBindingSuffix(tData, bindingIndex);
    const name = suffix ? `${prop}.${suffix}` : prop;
    str += `  ${getPrintedBindingName(name, hostBindingsMode)}: ${bindingIndex}\n`;
    bindingIndex = getNextBindingIndex(tData, bindingIndex);
  }

  /* tslint:disable */
  console.log(str);
}

/**
 * Used for printing the binding on screen.
 *
 * If it's a host binding then it will print `@HostBinding(NAME)`.
 * If it's a template binding then it will print `[NAME]`.
 */
function getPrintedBindingName(name: string, isHostBinding: boolean): string {
  return isHostBinding ? `@HostBinding("${name}")` : `[${name}]`;
}

/**
 * Prints out a comprehensive table of all the style or class bindings within the provided `tData`
 * and `lView` arrays
 */
export function printStylingTable(
    tData: TData, tNode: TNode, lView: LStylingData, isClassBased: boolean): void {
  const head = getStylingHead(tNode, isClassBased);
  const tail = getStylingTail(tNode, isClassBased);

  let bindingIndex = head;
  const entries = [];

  const initial = isClassBased ? tNode.classes : tNode.styles;
  entries.push({prop: 'HEAD', index: null, value: head});
  entries.push({prop: 'TAIL', index: null, value: tail});

  entries.push({prop: 'INITIAL', index: null, value: initial});

  entries.push({});

  while (bindingIndex !== 0) {
    const next = getNextBindingIndex(tData, bindingIndex);
    let prop = tData[bindingIndex] as string || '[MAP]';
    let letter = 'Tpl';
    if (isDirectiveHostBinding(tData, bindingIndex)) {
      letter = 'Dir';
    }
    if (isComponentHostBinding(tData, bindingIndex)) {
      letter = 'Cmp';
    }
    prop = `${letter} - ${prop}`;

    const previous = getPreviousBindingIndex(tData, bindingIndex);
    entries.push({
      prop,
      index: bindingIndex,
      value: getValue(lView, bindingIndex),
      concatenatedValue: getConcatenatedValue(lView, bindingIndex),
      indices: `${previous} | ${next}`,
    });

    bindingIndex = next;
  }

  /* tslint:disable */
  console.table(entries);
}
