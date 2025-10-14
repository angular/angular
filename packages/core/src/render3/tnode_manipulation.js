/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertEqual, assertGreaterThanOrEqual, assertNotSame} from '../util/assert';
import {assertTNodeForTView} from './assert';
import {HEADER_OFFSET} from './interfaces/view';
import {assertPureTNodeType} from './node_assert';
import {
  getCurrentParentTNode,
  getCurrentTNodePlaceholderOk,
  isCurrentTNodeParent,
  isInI18nBlock,
  isInSkipHydrationBlock,
  setCurrentTNode,
} from './state';
export function getOrCreateTNode(tView, index, type, name, attrs) {
  ngDevMode &&
    index !== 0 && // 0 are bogus nodes and they are OK. See `createContainerRef` in
    // `view_engine_compatibility` for additional context.
    assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
  // Keep this function short, so that the VM will inline it.
  ngDevMode && assertPureTNodeType(type);
  let tNode = tView.data[index];
  if (tNode === null) {
    tNode = createTNodeAtIndex(tView, index, type, name, attrs);
    if (isInI18nBlock()) {
      // If we are in i18n block then all elements should be pre declared through `Placeholder`
      // See `TNodeType.Placeholder` and `LFrame.inI18n` for more context.
      // If the `TNode` was not pre-declared than it means it was not mentioned which means it was
      // removed, so we mark it as detached.
      tNode.flags |= 32 /* TNodeFlags.isDetached */;
    }
  } else if (tNode.type & 64 /* TNodeType.Placeholder */) {
    tNode.type = type;
    tNode.value = name;
    tNode.attrs = attrs;
    const parent = getCurrentParentTNode();
    tNode.injectorIndex = parent === null ? -1 : parent.injectorIndex;
    ngDevMode && assertTNodeForTView(tNode, tView);
    ngDevMode && assertEqual(index, tNode.index, 'Expecting same index');
  }
  setCurrentTNode(tNode, true);
  return tNode;
}
export function createTNodeAtIndex(tView, index, type, name, attrs) {
  const currentTNode = getCurrentTNodePlaceholderOk();
  const isParent = isCurrentTNodeParent();
  const parent = isParent ? currentTNode : currentTNode && currentTNode.parent;
  // Parents cannot cross component boundaries because components will be used in multiple places.
  const tNode = (tView.data[index] = createTNode(tView, parent, type, index, name, attrs));
  // Assign a pointer to the first child node of a given view. The first node is not always the one
  // at index 0, in case of i18n, index 0 can be the instruction `i18nStart` and the first node has
  // the index 1 or more, so we can't just check node index.
  linkTNodeInTView(tView, tNode, currentTNode, isParent);
  return tNode;
}
function linkTNodeInTView(tView, tNode, currentTNode, isParent) {
  if (tView.firstChild === null) {
    tView.firstChild = tNode;
  }
  if (currentTNode !== null) {
    if (isParent) {
      // FIXME(misko): This logic looks unnecessarily complicated. Could we simplify?
      if (currentTNode.child == null && tNode.parent !== null) {
        // We are in the same view, which means we are adding content node to the parent view.
        currentTNode.child = tNode;
      }
    } else {
      if (currentTNode.next === null) {
        // In the case of i18n the `currentTNode` may already be linked, in which case we don't want
        // to break the links which i18n created.
        currentTNode.next = tNode;
        tNode.prev = currentTNode;
      }
    }
  }
}
export function createTNode(tView, tParent, type, index, value, attrs) {
  ngDevMode &&
    index !== 0 && // 0 are bogus nodes and they are OK. See `createContainerRef` in
    // `view_engine_compatibility` for additional context.
    assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
  ngDevMode && assertNotSame(attrs, undefined, "'undefined' is not valid value for 'attrs'");
  ngDevMode && tParent && assertTNodeForTView(tParent, tView);
  let injectorIndex = tParent ? tParent.injectorIndex : -1;
  let flags = 0;
  if (isInSkipHydrationBlock()) {
    flags |= 128 /* TNodeFlags.inSkipHydrationBlock */;
  }
  // TODO: would it be helpful to use a prototypal inheritance here, similar to the way we do so with signals?
  const tNode = {
    type,
    index,
    insertBeforeIndex: null,
    injectorIndex,
    directiveStart: -1,
    directiveEnd: -1,
    directiveStylingLast: -1,
    componentOffset: -1,
    propertyBindings: null,
    flags,
    providerIndexes: 0,
    value: value,
    attrs: attrs,
    mergedAttrs: null,
    localNames: null,
    initialInputs: null,
    inputs: null,
    hostDirectiveInputs: null,
    outputs: null,
    hostDirectiveOutputs: null,
    directiveToIndex: null,
    tView: null,
    next: null,
    prev: null,
    projectionNext: null,
    child: null,
    parent: tParent,
    projection: null,
    styles: null,
    stylesWithoutHost: null,
    residualStyles: undefined,
    classes: null,
    classesWithoutHost: null,
    residualClasses: undefined,
    classBindings: 0,
    styleBindings: 0,
  };
  if (ngDevMode) {
    // For performance reasons it is important that the tNode retains the same shape during runtime.
    // (To make sure that all of the code is monomorphic.) For this reason we seal the object to
    // prevent class transitions.
    Object.seal(tNode);
  }
  return tNode;
}
//# sourceMappingURL=tnode_manipulation.js.map
