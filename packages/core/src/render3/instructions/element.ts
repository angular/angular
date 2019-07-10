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
import {StylingContext} from '../interfaces/styling';
import {BINDING_INDEX, HEADER_OFFSET, QUERIES, RENDERER, TVIEW, T_HOST} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {appendChild} from '../node_manipulation';
import {applyOnCreateInstructions} from '../node_util';
import {decreaseElementDepthCount, getElementDepthCount, getIsParent, getLView, getPreviousOrParentTNode, getSelectedIndex, increaseElementDepthCount, setIsNotParent, setPreviousOrParentTNode} from '../state';
import {getInitialClassNameValue, getInitialStyleStringValue, initializeStaticContext, patchContextWithStaticAttrs, renderInitialClasses, renderInitialStyles} from '../styling/class_and_style_bindings';
import {getStylingContextFromLView, hasClassInput, hasStyleInput} from '../styling/util';
import {registerInitialStylingIntoContext} from '../styling_next/instructions';
import {runtimeIsNewStylingInUse} from '../styling_next/state';
import {attrsStylingIndexOf, setUpAttributes} from '../util/attrs_utils';
import {getNativeByTNode, getTNode} from '../util/view_utils';

import {createDirectivesAndLocals, elementCreate, executeContentQueries, getOrCreateTNode, initializeTNodeInputs, setInputsForProperty, setNodeStylingTemplate} from './shared';
import {getActiveDirectiveStylingIndex} from './styling';



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
  let initialStylesIndex = 0;
  let initialClassesIndex = 0;

  let lastAttrIndex = -1;
  if (attrs) {
    lastAttrIndex = setUpAttributes(native, attrs);

    // it's important to only prepare styling-related datastructures once for a given
    // tNode and not each time an element is created. Also, the styling code is designed
    // to be patched and constructed at various points, but only up until the styling
    // template is first allocated (which happens when the very first style/class binding
    // value is evaluated). When the template is allocated (when it turns into a context)
    // then the styling template is locked and cannot be further extended (it can only be
    // instantiated into a context per element)
    setNodeStylingTemplate(tView, tNode, attrs, lastAttrIndex);

    const stylingTemplate = tNode.stylingTemplate;
    if (stylingTemplate) {
      // the initial style/class values are rendered immediately after having been
      // initialized into the context so the element styling is ready when directives
      // are initialized (since they may read style/class values in their constructor)
      initialStylesIndex = renderInitialStyles(native, stylingTemplate, renderer);
      initialClassesIndex = renderInitialClasses(native, stylingTemplate, renderer);
    }
  }

  appendChild(native, tNode, lView);
  createDirectivesAndLocals(tView, lView, tNode, localRefs);

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
    const inputData = initializeTNodeInputs(tNode);
    if (inputData && inputData.hasOwnProperty('class')) {
      tNode.flags |= TNodeFlags.hasClassInput;
    }
    if (inputData && inputData.hasOwnProperty('style')) {
      tNode.flags |= TNodeFlags.hasStyleInput;
    }
  }

  // we render the styling again below in case any directives have set any `style` and/or
  // `class` host attribute values...
  if (tNode.stylingTemplate) {
    renderInitialClasses(native, tNode.stylingTemplate, renderer, initialClassesIndex);
    renderInitialStyles(native, tNode.stylingTemplate, renderer, initialStylesIndex);
  }

  if (runtimeIsNewStylingInUse() && lastAttrIndex >= 0) {
    registerInitialStylingIntoContext(tNode, attrs as TAttributes, lastAttrIndex);
  }

  const currentQueries = lView[QUERIES];
  if (currentQueries) {
    currentQueries.addNode(tNode);
    lView[QUERIES] = currentQueries.clone(tNode);
  }
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

  // this is required for all host-level styling-related instructions to run
  // in the correct order
  previousOrParentTNode.onElementCreationFns && applyOnCreateInstructions(previousOrParentTNode);

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Element);
  const lView = getLView();
  const currentQueries = lView[QUERIES];
  // Go back up to parent queries only if queries have been cloned on this element.
  if (currentQueries && previousOrParentTNode.index === currentQueries.nodeIndex) {
    lView[QUERIES] = currentQueries.parent;
  }

  registerPostOrderHooks(lView[TVIEW], previousOrParentTNode);
  decreaseElementDepthCount();

  // this is fired at the end of elementEnd because ALL of the stylingBindings code
  // (for directives and the template) have now executed which means the styling
  // context can be instantiated properly.
  let stylingContext: StylingContext|null = null;
  if (hasClassInput(previousOrParentTNode)) {
    stylingContext = getStylingContextFromLView(previousOrParentTNode.index, lView);
    setInputsForProperty(
        lView, previousOrParentTNode.inputs !['class'] !, getInitialClassNameValue(stylingContext));
  }
  if (hasStyleInput(previousOrParentTNode)) {
    stylingContext =
        stylingContext || getStylingContextFromLView(previousOrParentTNode.index, lView);
    setInputsForProperty(
        lView, previousOrParentTNode.inputs !['style'] !,
        getInitialStyleStringValue(stylingContext));
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
  const tNode = getTNode(hostElementIndex, lView);

  // non-element nodes (e.g. `<ng-container>`) are not rendered as actual
  // element nodes and adding styles/classes on to them will cause runtime
  // errors...
  if (tNode.type === TNodeType.Element) {
    const native = getNativeByTNode(tNode, lView) as RElement;
    const lastAttrIndex = setUpAttributes(native, attrs);
    const stylingAttrsStartIndex = attrsStylingIndexOf(attrs, lastAttrIndex);
    if (stylingAttrsStartIndex >= 0) {
      const directiveStylingIndex = getActiveDirectiveStylingIndex();
      if (tNode.stylingTemplate) {
        patchContextWithStaticAttrs(
            tNode.stylingTemplate, attrs, stylingAttrsStartIndex, directiveStylingIndex);
      } else {
        tNode.stylingTemplate =
            initializeStaticContext(attrs, stylingAttrsStartIndex, directiveStylingIndex);
      }
    }
  }
}
