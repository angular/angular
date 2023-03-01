/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual, assertIndexInRange} from '../../util/assert';
import {assertFirstCreatePass, assertHasParent} from '../assert';
import {attachPatchData} from '../context_discovery';
import {registerPostOrderHooks} from '../hooks';
import {hasClassInput, hasStyleInput, TAttributes, TElementNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer_dom';
import {isContentQueryHost, isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {appendChild, createElementNode, setupStaticAttributes} from '../node_manipulation';
import {decreaseElementDepthCount, getBindingIndex, getCurrentTNode, getElementDepthCount, getLView, getNamespace, getTView, increaseElementDepthCount, isCurrentTNodeParent, setCurrentTNode, setCurrentTNodeAsNotParent} from '../state';
import {computeStaticStyling} from '../styling/static_styling';
import {getConstant} from '../util/view_utils';

import {validateElementIsKnown} from './element_validation';
import {setDirectiveInputsWhichShadowsStyling} from './property';
import {createDirectivesInstances, executeContentQueries, getOrCreateTNode, resolveDirectives, saveResolvedLocalsInData} from './shared';


function elementStartFirstCreatePass(
    index: number, tView: TView, lView: LView, name: string, attrsIndex?: number|null,
    localRefsIndex?: number): TElementNode {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && ngDevMode.firstCreatePass++;

  const tViewConsts = tView.consts;
  const attrs = getConstant<TAttributes>(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, TNodeType.Element, name, attrs);

  resolveDirectives(tView, lView, tNode, getConstant<string[]>(tViewConsts, localRefsIndex));

  if (tNode.attrs !== null) {
    computeStaticStyling(tNode, tNode.attrs, false);
  }

  if (tNode.mergedAttrs !== null) {
    computeStaticStyling(tNode, tNode.mergedAttrs, true);
  }

  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }

  return tNode;
}

/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 *
 * @codeGenApi
 */
export function ɵɵelementStart(
    index: number, name: string, attrsIndex?: number|null,
    localRefsIndex?: number): typeof ɵɵelementStart {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = HEADER_OFFSET + index;

  ngDevMode &&
      assertEqual(
          getBindingIndex(), tView.bindingStartIndex,
          'elements should be created before any bindings');
  ngDevMode && assertIndexInRange(lView, adjustedIndex);

  const renderer = lView[RENDERER];
  const tNode = tView.firstCreatePass ?
      elementStartFirstCreatePass(adjustedIndex, tView, lView, name, attrsIndex, localRefsIndex) :
      tView.data[adjustedIndex] as TElementNode;
  const native = lView[adjustedIndex] = createElementNode(renderer, name, getNamespace());
  const hasDirectives = isDirectiveHost(tNode);

  if (ngDevMode && tView.firstCreatePass) {
    validateElementIsKnown(native, lView, tNode.value, tView.schemas, hasDirectives);
  }

  setCurrentTNode(tNode, true);
  setupStaticAttributes(renderer, native, tNode);

  if ((tNode.flags & TNodeFlags.isDetached) !== TNodeFlags.isDetached) {
    // In the i18n case, the translation may have removed this element, so only add it if it is not
    // detached. See `TNodeType.Placeholder` and `LFrame.inI18n` for more context.
    appendChild(tView, lView, native, tNode);
  }

  // any immediate children of a component or template container must be pre-emptively
  // monkey-patched with the component view data so that the element can be inspected
  // later on using any element discovery utility methods (see `element_discovery.ts`)
  if (getElementDepthCount() === 0) {
    attachPatchData(native, lView);
  }
  increaseElementDepthCount();

  if (hasDirectives) {
    createDirectivesInstances(tView, lView, tNode);
    executeContentQueries(tView, tNode, lView);
  }
  if (localRefsIndex !== null) {
    saveResolvedLocalsInData(lView, tNode);
  }
  return ɵɵelementStart;
}

/**
 * Mark the end of the element.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵelementEnd(): typeof ɵɵelementEnd {
  let currentTNode = getCurrentTNode()!;
  ngDevMode && assertDefined(currentTNode, 'No parent node to close.');
  if (isCurrentTNodeParent()) {
    setCurrentTNodeAsNotParent();
  } else {
    ngDevMode && assertHasParent(getCurrentTNode());
    currentTNode = currentTNode.parent!;
    setCurrentTNode(currentTNode, false);
  }

  const tNode = currentTNode;
  ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode);


  decreaseElementDepthCount();

  const tView = getTView();
  if (tView.firstCreatePass) {
    registerPostOrderHooks(tView, currentTNode);
    if (isContentQueryHost(currentTNode)) {
      tView.queries!.elementEnd(currentTNode);
    }
  }

  if (tNode.classesWithoutHost != null && hasClassInput(tNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, tNode, getLView(), tNode.classesWithoutHost, true);
  }

  if (tNode.stylesWithoutHost != null && hasStyleInput(tNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, tNode, getLView(), tNode.stylesWithoutHost, false);
  }
  return ɵɵelementEnd;
}

/**
 * Creates an empty element using {@link elementStart} and {@link elementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵelement(
    index: number, name: string, attrsIndex?: number|null,
    localRefsIndex?: number): typeof ɵɵelement {
  ɵɵelementStart(index, name, attrsIndex, localRefsIndex);
  ɵɵelementEnd();
  return ɵɵelement;
}
