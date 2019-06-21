/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDataInRange, assertDefined, assertEqual} from '../../util/assert';
import {assertHasParent} from '../assert';
import {attachPatchData} from '../context_discovery';
import {registerPostOrderHooks} from '../hooks';
import {TAttributes, TNodeFlags, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {isContentQueryHost} from '../interfaces/type_checks';
import {BINDING_INDEX, HEADER_OFFSET, LView, RENDERER, TVIEW, T_HOST} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {appendChild} from '../node_manipulation';
import {decreaseElementDepthCount, getElementDepthCount, getIsParent, getLView, getPreviousOrParentTNode, getSelectedIndex, increaseElementDepthCount, setIsNotParent, setPreviousOrParentTNode} from '../state';
import {registerInitialStylingOnTNode} from '../styling_next/instructions';
import {StylingMapArray, TStylingContext} from '../styling_next/interfaces';
import {getInitialStylingValue, hasClassInput, hasStyleInput} from '../styling_next/util';
import {setUpAttributes} from '../util/attrs_utils';
import {getNativeByTNode, getTNode} from '../util/view_utils';

import {createDirectivesAndLocals, elementCreate, executeContentQueries, getOrCreateTNode, initializeTNodeInputs, renderInitialStyling, resolveDirectives, setInputsForProperty} from './shared';



/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes, classes, and styles to be written into the DOM
 *              element on creation. Use [AttributeMarker] to denote the meaning of this array.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 *
 * @codeGenApi
 */
export function ɵɵelementStart(
    index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], tView.bindingStartIndex,
                   'elements should be created before any bindings ');

  ngDevMode && ngDevMode.rendererCreateElement++;
  ngDevMode && assertDataInRange(lView, index + HEADER_OFFSET);
  const native = lView[index + HEADER_OFFSET] = elementCreate(name);
  const renderer = lView[RENDERER];
  const tNode =
      getOrCreateTNode(tView, lView[T_HOST], index, TNodeType.Element, name, attrs || null);

  if (attrs != null) {
    const lastAttrIndex = setUpAttributes(native, attrs);
    if (tView.firstTemplatePass) {
      registerInitialStylingOnTNode(tNode, attrs, lastAttrIndex);
    }
  }

  renderInitialStyling(renderer, native, tNode);

  appendChild(native, tNode, lView);

  // any immediate children of a component or template container must be pre-emptively
  // monkey-patched with the component view data so that the element can be inspected
  // later on using any element discovery utility methods (see `element_discovery.ts`)
  if (getElementDepthCount() === 0) {
    attachPatchData(native, lView);
  }
  increaseElementDepthCount();

  // if a directive contains a host binding for "class" then all class-based data will
  // flow through that (except for `[class.prop]` bindings). This also includes initial
  // static class values as well. (Note that this will be fixed once map-based `[style]`
  // and `[class]` bindings work for multiple directives.)
  if (tView.firstTemplatePass) {
    ngDevMode && ngDevMode.firstTemplatePass++;
    resolveDirectives(tView, lView, tNode, localRefs || null);

    const inputData = initializeTNodeInputs(tNode);
    if (inputData && inputData.hasOwnProperty('class')) {
      tNode.flags |= TNodeFlags.hasClassInput;
    }

    if (inputData && inputData.hasOwnProperty('style')) {
      tNode.flags |= TNodeFlags.hasStyleInput;
    }

    if (tView.queries !== null) {
      tView.queries.elementStart(tView, tNode);
    }
  }

  createDirectivesAndLocals(tView, lView, tNode);
  executeContentQueries(tView, tNode, lView);
}

/**
 * Mark the end of the element.
 *
 * @codeGenApi
 */
export function ɵɵelementEnd(): void {
  let previousOrParentTNode = getPreviousOrParentTNode();
  ngDevMode && assertDefined(previousOrParentTNode, 'No parent node to close.');
  if (getIsParent()) {
    setIsNotParent();
  } else {
    ngDevMode && assertHasParent(getPreviousOrParentTNode());
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode, false);
  }

  const tNode = previousOrParentTNode;
  ngDevMode && assertNodeType(tNode, TNodeType.Element);

  const lView = getLView();
  const tView = lView[TVIEW];

  registerPostOrderHooks(tView, previousOrParentTNode);
  decreaseElementDepthCount();

  if (tView.firstTemplatePass && tView.queries !== null &&
      isContentQueryHost(previousOrParentTNode)) {
    tView.queries !.elementEnd(previousOrParentTNode);
  }

  if (hasClassInput(tNode) && tNode.classes) {
    setDirectiveStylingInput(tNode.classes, lView, tNode.inputs !['class']);
  }

  if (hasStyleInput(tNode) && tNode.styles) {
    setDirectiveStylingInput(tNode.styles, lView, tNode.inputs !['style']);
  }
}


/**
 * Creates an empty element using {@link elementStart} and {@link elementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes, classes, and styles to be written into the DOM
 *              element on creation. Use [AttributeMarker] to denote the meaning of this array.
 * @param localRefs A set of local reference bindings on the element.
 *
 * @codeGenApi
 */
export function ɵɵelement(
    index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  ɵɵelementStart(index, name, attrs, localRefs);
  ɵɵelementEnd();
}

/**
 * Assign static attribute values to a host element.
 *
 * This instruction will assign static attribute values as well as class and style
 * values to an element within the host bindings function. Since attribute values
 * can consist of different types of values, the `attrs` array must include the values in
 * the following format:
 *
 * attrs = [
 *   // static attributes (like `title`, `name`, `id`...)
 *   attr1, value1, attr2, value,
 *
 *   // a single namespace value (like `x:id`)
 *   NAMESPACE_MARKER, namespaceUri1, name1, value1,
 *
 *   // another single namespace value (like `x:name`)
 *   NAMESPACE_MARKER, namespaceUri2, name2, value2,
 *
 *   // a series of CSS classes that will be applied to the element (no spaces)
 *   CLASSES_MARKER, class1, class2, class3,
 *
 *   // a series of CSS styles (property + value) that will be applied to the element
 *   STYLES_MARKER, prop1, value1, prop2, value2
 * ]
 *
 * All non-class and non-style attributes must be defined at the start of the list
 * first before all class and style values are set. When there is a change in value
 * type (like when classes and styles are introduced) a marker must be used to separate
 * the entries. The marker values themselves are set via entries found in the
 * [AttributeMarker] enum.
 *
 * NOTE: This instruction is meant to used from `hostBindings` function only.
 *
 * @param directive A directive instance the styling is associated with.
 * @param attrs An array of static values (attributes, classes and styles) with the correct marker
 * values.
 *
 * @codeGenApi
 */
export function ɵɵelementHostAttrs(attrs: TAttributes) {
  const hostElementIndex = getSelectedIndex();
  const lView = getLView();
  const tView = lView[TVIEW];
  const tNode = getTNode(hostElementIndex, lView);

  // non-element nodes (e.g. `<ng-container>`) are not rendered as actual
  // element nodes and adding styles/classes on to them will cause runtime
  // errors...
  if (tNode.type === TNodeType.Element) {
    const native = getNativeByTNode(tNode, lView) as RElement;
    const lastAttrIndex = setUpAttributes(native, attrs);
    if (tView.firstTemplatePass) {
      const stylingNeedsToBeRendered = registerInitialStylingOnTNode(tNode, attrs, lastAttrIndex);

      // this is only called during the first template pass in the
      // event that this current directive assigned initial style/class
      // host attribute values to the element. Because initial styling
      // values are applied before directives are first rendered (within
      // `createElement`) this means that initial styling for any directives
      // still needs to be applied. Note that this will only happen during
      // the first template pass and not each time a directive applies its
      // attribute values to the element.
      if (stylingNeedsToBeRendered) {
        const renderer = lView[RENDERER];
        renderInitialStyling(renderer, native, tNode);
      }
    }
  }
}

function setDirectiveStylingInput(
    context: TStylingContext | StylingMapArray, lView: LView, stylingInputs: (string | number)[]) {
  // older versions of Angular treat the input as `null` in the
  // event that the value does not exist at all. For this reason
  // we can't have a styling value be an empty string.
  const value = getInitialStylingValue(context) || null;

  // Ivy does an extra `[class]` write with a falsy value since the value
  // is applied during creation mode. This is a deviation from VE and should
  // be (Jira Issue = FW-1467).
  setInputsForProperty(lView, stylingInputs, value);
}
