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
import {formatRuntimeError, RuntimeErrorCode} from '../error_code';
import {registerPostOrderHooks} from '../hooks';
import {hasClassInput, hasStyleInput, TAttributes, TElementNode, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer_dom';
import {isContentQueryHost, isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {appendChild, createElementNode, writeDirectClass, writeDirectStyle} from '../node_manipulation';
import {decreaseElementDepthCount, getBindingIndex, getCurrentTNode, getElementDepthCount, getLView, getNamespace, getTView, increaseElementDepthCount, isCurrentTNodeParent, setCurrentTNode, setCurrentTNodeAsNotParent} from '../state';
import {computeStaticStyling} from '../styling/static_styling';
import {setUpAttributes} from '../util/attrs_utils';
import {getConstant} from '../util/view_utils';
import {setDirectiveInputsWhichShadowsStyling} from './property';
import {createDirectivesInstances, executeContentQueries, getOrCreateTNode, matchingSchemas, resolveDirectives, saveResolvedLocalsInData} from './shared';



function elementStartFirstCreatePass(
    index: number, tView: TView, lView: LView, native: RElement, name: string,
    attrsIndex?: number|null, localRefsIndex?: number): TElementNode {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && ngDevMode.firstCreatePass++;

  const tViewConsts = tView.consts;
  const attrs = getConstant<TAttributes>(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, TNodeType.Element, name, attrs);

  const hasDirectives =
      resolveDirectives(tView, lView, tNode, getConstant<string[]>(tViewConsts, localRefsIndex));
  ngDevMode && logUnknownElementError(tView, native, tNode, hasDirectives);

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
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 *
 * @codeGenApi
 */
export function ɵɵelementStart(
    index: number, name: string, attrsIndex?: number|null, localRefsIndex?: number): void {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = HEADER_OFFSET + index;

  ngDevMode &&
      assertEqual(
          getBindingIndex(), tView.bindingStartIndex,
          'elements should be created before any bindings');
  ngDevMode && assertIndexInRange(lView, adjustedIndex);

  const renderer = lView[RENDERER];
  const native = lView[adjustedIndex] = createElementNode(renderer, name, getNamespace());
  const tNode = tView.firstCreatePass ?
      elementStartFirstCreatePass(
          adjustedIndex, tView, lView, native, name, attrsIndex, localRefsIndex) :
      tView.data[adjustedIndex] as TElementNode;
  setCurrentTNode(tNode, true);

  const mergedAttrs = tNode.mergedAttrs;
  if (mergedAttrs !== null) {
    setUpAttributes(renderer, native, mergedAttrs);
  }
  const classes = tNode.classes;
  if (classes !== null) {
    writeDirectClass(renderer, native, classes);
  }
  const styles = tNode.styles;
  if (styles !== null) {
    writeDirectStyle(renderer, native, styles);
  }

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


  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(tView, lView, tNode);
    executeContentQueries(tView, tNode, lView);
  }
  if (localRefsIndex !== null) {
    saveResolvedLocalsInData(lView, tNode);
  }
}

/**
 * Mark the end of the element.
 *
 * @codeGenApi
 */
export function ɵɵelementEnd(): void {
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
}

/**
 * Creates an empty element using {@link elementStart} and {@link elementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 *
 * @codeGenApi
 */
export function ɵɵelement(
    index: number, name: string, attrsIndex?: number|null, localRefsIndex?: number): void {
  ɵɵelementStart(index, name, attrsIndex, localRefsIndex);
  ɵɵelementEnd();
}

function logUnknownElementError(
    tView: TView, element: RElement, tNode: TNode, hasDirectives: boolean): void {
  const schemas = tView.schemas;

  // If `schemas` is set to `null`, that's an indication that this Component was compiled in AOT
  // mode where this check happens at compile time. In JIT mode, `schemas` is always present and
  // defined as an array (as an empty array in case `schemas` field is not defined) and we should
  // execute the check below.
  if (schemas === null) return;

  const tagName = tNode.value;

  // If the element matches any directive, it's considered as valid.
  if (!hasDirectives && tagName !== null) {
    // The element is unknown if it's an instance of HTMLUnknownElement or it isn't registered
    // as a custom element. Note that unknown elements with a dash in their name won't be instances
    // of HTMLUnknownElement in browsers that support web components.
    const isUnknown =
        // Note that we can't check for `typeof HTMLUnknownElement === 'function'`,
        // because while most browsers return 'function', IE returns 'object'.
        (typeof HTMLUnknownElement !== 'undefined' && HTMLUnknownElement &&
         element instanceof HTMLUnknownElement) ||
        (typeof customElements !== 'undefined' && tagName.indexOf('-') > -1 &&
         !customElements.get(tagName));

    if (isUnknown && !matchingSchemas(tView, tagName)) {
      let message = `'${tagName}' is not a known element:\n`;
      message += `1. If '${
          tagName}' is an Angular component, then verify that it is part of this module.\n`;
      if (tagName && tagName.indexOf('-') > -1) {
        message += `2. If '${
            tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`;
      } else {
        message +=
            `2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
      }
      console.error(formatRuntimeError(RuntimeErrorCode.UNKNOWN_ELEMENT, message));
    }
  }
}
