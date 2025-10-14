/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../errors';
import {
  assertDefined,
  assertEqual,
  assertIndexInRange,
  assertLessThan,
  assertNumber,
  throwError,
} from '../util/assert';
import {getComponentDef, getNgModuleDef} from './def_getters';
import {isLContainer, isLView} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, T_HOST, TVIEW} from './interfaces/view';
// [Assert functions do not constraint type when they are guarded by a truthy
// expression.](https://github.com/microsoft/TypeScript/issues/37295)
export function assertTNodeForLView(tNode, lView) {
  assertTNodeForTView(tNode, lView[TVIEW]);
}
export function assertTNodeCreationIndex(lView, index) {
  const adjustedIndex = index + HEADER_OFFSET;
  assertIndexInRange(lView, adjustedIndex);
  assertLessThan(
    adjustedIndex,
    lView[TVIEW].bindingStartIndex,
    'TNodes should be created before any bindings',
  );
}
export function assertTNodeForTView(tNode, tView) {
  assertTNode(tNode);
  const tData = tView.data;
  for (let i = HEADER_OFFSET; i < tData.length; i++) {
    if (tData[i] === tNode) {
      return;
    }
  }
  throwError('This TNode does not belong to this TView.');
}
export function assertTNode(tNode) {
  assertDefined(tNode, 'TNode must be defined');
  if (!(tNode && typeof tNode === 'object' && tNode.hasOwnProperty('directiveStylingLast'))) {
    throwError('Not of type TNode, got: ' + tNode);
  }
}
export function assertTIcu(tIcu) {
  assertDefined(tIcu, 'Expected TIcu to be defined');
  if (!(typeof tIcu.currentCaseLViewIndex === 'number')) {
    throwError('Object is not of TIcu type.');
  }
}
export function assertComponentType(
  actual,
  msg = "Type passed in is not ComponentType, it does not have 'ɵcmp' property.",
) {
  if (!getComponentDef(actual)) {
    throwError(msg);
  }
}
export function assertNgModuleType(
  actual,
  msg = "Type passed in is not NgModuleType, it does not have 'ɵmod' property.",
) {
  if (!getNgModuleDef(actual)) {
    throwError(msg);
  }
}
export function assertCurrentTNodeIsParent(isParent) {
  assertEqual(isParent, true, 'currentTNode should be a parent');
}
export function assertHasParent(tNode) {
  assertDefined(tNode, 'currentTNode should exist!');
  assertDefined(tNode.parent, 'currentTNode should have a parent');
}
export function assertLContainer(value) {
  assertDefined(value, 'LContainer must be defined');
  assertEqual(isLContainer(value), true, 'Expecting LContainer');
}
export function assertLViewOrUndefined(value) {
  value && assertEqual(isLView(value), true, 'Expecting LView or undefined or null');
}
export function assertLView(value) {
  assertDefined(value, 'LView must be defined');
  assertEqual(isLView(value), true, 'Expecting LView');
}
export function assertFirstCreatePass(tView, errMessage) {
  assertEqual(
    tView.firstCreatePass,
    true,
    errMessage || 'Should only be called in first create pass.',
  );
}
export function assertFirstUpdatePass(tView, errMessage) {
  assertEqual(
    tView.firstUpdatePass,
    true,
    errMessage || 'Should only be called in first update pass.',
  );
}
/**
 * This is a basic sanity check that an object is probably a directive def. DirectiveDef is
 * an interface, so we can't do a direct instanceof check.
 */
export function assertDirectiveDef(obj) {
  if (obj.type === undefined || obj.selectors == undefined || obj.inputs === undefined) {
    throwError(
      `Expected a DirectiveDef/ComponentDef and this object does not seem to have the expected shape.`,
    );
  }
}
export function assertIndexInDeclRange(tView, index) {
  assertBetween(HEADER_OFFSET, tView.bindingStartIndex, index);
}
export function assertIndexInExpandoRange(lView, index) {
  const tView = lView[1];
  assertBetween(tView.expandoStartIndex, lView.length, index);
}
export function assertBetween(lower, upper, index) {
  if (!(lower <= index && index < upper)) {
    throwError(`Index out of range (expecting ${lower} <= ${index} < ${upper})`);
  }
}
export function assertProjectionSlots(lView, errMessage) {
  assertDefined(lView[DECLARATION_COMPONENT_VIEW], 'Component views should exist.');
  assertDefined(
    lView[DECLARATION_COMPONENT_VIEW][T_HOST].projection,
    errMessage ||
      'Components with projection nodes (<ng-content>) must have projection slots defined.',
  );
}
export function assertParentView(lView, errMessage) {
  assertDefined(
    lView,
    errMessage || "Component views should always have a parent view (component's host view)",
  );
}
export function assertNoDuplicateDirectives(directives) {
  // The array needs at least two elements in order to have duplicates.
  if (directives.length < 2) {
    return;
  }
  const seenDirectives = new Set();
  for (const current of directives) {
    if (seenDirectives.has(current)) {
      throw new RuntimeError(
        309 /* RuntimeErrorCode.DUPLICATE_DIRECTIVE */,
        `Directive ${current.type.name} matches multiple times on the same element. ` +
          `Directives can only match an element once.`,
      );
    }
    seenDirectives.add(current);
  }
}
/**
 * This is a basic sanity check that the `injectorIndex` seems to point to what looks like a
 * NodeInjector data structure.
 *
 * @param lView `LView` which should be checked.
 * @param injectorIndex index into the `LView` where the `NodeInjector` is expected.
 */
export function assertNodeInjector(lView, injectorIndex) {
  assertIndexInExpandoRange(lView, injectorIndex);
  assertIndexInExpandoRange(lView, injectorIndex + 8 /* NodeInjectorOffset.PARENT */);
  assertNumber(lView[injectorIndex + 0], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 1], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 2], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 3], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 4], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 5], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 6], 'injectorIndex should point to a bloom filter');
  assertNumber(lView[injectorIndex + 7], 'injectorIndex should point to a bloom filter');
  assertNumber(
    lView[injectorIndex + 8 /* NodeInjectorOffset.PARENT */],
    'injectorIndex should point to parent injector',
  );
}
//# sourceMappingURL=assert.js.map
