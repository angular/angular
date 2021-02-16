/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual, assertNumber, throwError} from '../util/assert';

import {getComponentDef, getNgModuleDef} from './definition';
import {LContainer} from './interfaces/container';
import {DirectiveDef} from './interfaces/definition';
import {TIcu} from './interfaces/i18n';
import {NodeInjectorOffset} from './interfaces/injector';
import {TNode} from './interfaces/node';
import {isLContainer, isLView} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, LView, T_HOST, TVIEW, TView} from './interfaces/view';

// [Assert functions do not constraint type when they are guarded by a truthy
// expression.](https://github.com/microsoft/TypeScript/issues/37295)


export function assertTNodeForLView(tNode: TNode, lView: LView) {
  assertTNodeForTView(tNode, lView[TVIEW]);
}

export function assertTNodeForTView(tNode: TNode, tView: TView) {
  assertTNode(tNode);
  tNode.hasOwnProperty('tView_') &&
      assertEqual(
          (tNode as any as {tView_: TView}).tView_, tView,
          'This TNode does not belong to this TView.');
}

export function assertTNode(tNode: TNode) {
  assertDefined(tNode, 'TNode must be defined');
  if (!(tNode && typeof tNode === 'object' && tNode.hasOwnProperty('directiveStylingLast'))) {
    throwError('Not of type TNode, got: ' + tNode);
  }
}


export function assertTIcu(tIcu: TIcu) {
  assertDefined(tIcu, 'Expected TIcu to be defined');
  if (!(typeof tIcu.currentCaseLViewIndex === 'number')) {
    throwError('Object is not of TIcu type.');
  }
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

export function assertCurrentTNodeIsParent(isParent: boolean) {
  assertEqual(isParent, true, 'currentTNode should be a parent');
}

export function assertHasParent(tNode: TNode|null) {
  assertDefined(tNode, 'currentTNode should exist!');
  assertDefined(tNode!.parent, 'currentTNode should have a parent');
}

export function assertDataNext(lView: LView, index: number, arr?: any[]) {
  if (arr == null) arr = lView;
  assertEqual(
      arr.length, index, `index ${index} expected to be at the end of arr (length ${arr.length})`);
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

export function assertIndexInDeclRange(lView: LView, index: number) {
  const tView = lView[1];
  assertBetween(HEADER_OFFSET, tView.bindingStartIndex, index);
}

export function assertIndexInVarsRange(lView: LView, index: number) {
  const tView = lView[1];
  assertBetween(tView.bindingStartIndex, tView.expandoStartIndex, index);
}

export function assertIndexInExpandoRange(lView: LView, index: number) {
  const tView = lView[1];
  assertBetween(tView.expandoStartIndex, lView.length, index);
}

export function assertBetween(lower: number, upper: number, index: number) {
  if (!(lower <= index && index < upper)) {
    throwError(`Index out of range (expecting ${lower} <= ${index} < ${upper})`);
  }
}

export function assertProjectionSlots(lView: LView, errMessage?: string) {
  assertDefined(lView[DECLARATION_COMPONENT_VIEW], 'Component views should exist.');
  assertDefined(
      lView[DECLARATION_COMPONENT_VIEW][T_HOST]!.projection,
      errMessage ||
          'Components with projection nodes (<ng-content>) must have projection slots defined.');
}

export function assertParentView(lView: LView|null, errMessage?: string) {
  assertDefined(
      lView,
      errMessage || 'Component views should always have a parent view (component\'s host view)');
}


/**
 * This is a basic sanity check that the `injectorIndex` seems to point to what looks like a
 * NodeInjector data structure.
 *
 * @param lView `LView` which should be checked.
 * @param injectorIndex index into the `LView` where the `NodeInjector` is expected.
 */
export function assertNodeInjector(lView: LView, injectorIndex: number) {
  assertIndexInExpandoRange(lView, injectorIndex);
  assertIndexInExpandoRange(lView, injectorIndex + NodeInjectorOffset.PARENT);
  assertNumber(lView[injectorIndex + 0], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 1], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 2], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 3], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 4], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 5], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 6], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 7], 'injectorIndex should point to a bloom filter');
  assertNumber(
      lView[injectorIndex + NodeInjectorOffset.PARENT],
      'injectorIndex should point to parent injector');
}
