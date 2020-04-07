/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual, throwError} from '../util/assert';

import {getComponentDef, getNgModuleDef} from './definition';
import {LContainer} from './interfaces/container';
import {DirectiveDef} from './interfaces/definition';
import {TNode} from './interfaces/node';
import {isLContainer, isLView} from './interfaces/type_checks';
import {LView, TVIEW, TView} from './interfaces/view';

// [Assert functions do not constraint type when they are guarded by a truthy
// expression.](https://github.com/microsoft/TypeScript/issues/37295)


export function assertTNodeForLView(tNode: TNode, lView: LView) {
  tNode.hasOwnProperty('tView_') && assertEqual(
                                        (tNode as any as{tView_: TView}).tView_, lView[TVIEW],
                                        'This TNode does not belong to this LView.');
}

export function assertComponentType(
    actual: any,
    msg: string = 'Type passed in is not ComponentType, it does not have \'ɵcmp\' property.') {
  if (!getComponentDef(actual)) {
    throwError(msg);
  }
}

export function assertNgModuleType(
    actual: any,
    msg: string = 'Type passed in is not NgModuleType, it does not have \'ɵmod\' property.') {
  if (!getNgModuleDef(actual)) {
    throwError(msg);
  }
}

export function assertPreviousIsParent(isParent: boolean) {
  assertEqual(isParent, true, 'previousOrParentTNode should be a parent');
}

export function assertHasParent(tNode: TNode | null) {
  assertDefined(tNode, 'previousOrParentTNode should exist!');
  assertDefined(tNode !.parent, 'previousOrParentTNode should have a parent');
}

export function assertDataNext(lView: LView, index: number, arr?: any[]) {
  if (arr == null) arr = lView;
  assertEqual(
      arr.length, index, `index ${index} expected to be at the end of arr (length ${arr.length})`);
}

export function assertLContainerOrUndefined(value: any): asserts value is LContainer|undefined|
    null {
  value && assertEqual(isLContainer(value), true, 'Expecting LContainer or undefined or null');
}

export function assertLContainer(value: any): asserts value is LContainer {
  assertDefined(value, 'LContainer must be defined');
  assertEqual(isLContainer(value), true, 'Expecting LContainer');
}

export function assertLViewOrUndefined(value: any): asserts value is LView|null|undefined {
  value && assertEqual(isLView(value), true, 'Expecting LView or undefined or null');
}

export function assertLView(value: any): asserts value is LView {
  assertDefined(value, 'LView must be defined');
  assertEqual(isLView(value), true, 'Expecting LView');
}

export function assertFirstCreatePass(tView: TView, errMessage?: string) {
  assertEqual(
      tView.firstCreatePass, true, errMessage || 'Should only be called in first create pass.');
}

export function assertFirstUpdatePass(tView: TView, errMessage?: string) {
  assertEqual(
      tView.firstUpdatePass, true, errMessage || 'Should only be called in first update pass.');
}

/**
 * This is a basic sanity check that an object is probably a directive def. DirectiveDef is
 * an interface, so we can't do a direct instanceof check.
 */
export function assertDirectiveDef<T>(obj: any): asserts obj is DirectiveDef<T> {
  if (obj.type === undefined || obj.selectors == undefined || obj.inputs === undefined) {
    throwError(
        `Expected a DirectiveDef/ComponentDef and this object does not seem to have the expected shape.`);
  }
}
