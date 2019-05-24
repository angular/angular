/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Sanitizer} from '../../sanitization/security';
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {LContainer} from '../interfaces/container';
import {AttributeMarker, TAttributes, TNode, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {StylingContext as OldStylingContext, StylingIndex as OldStylingIndex} from '../interfaces/styling';
import {BINDING_INDEX, HEADER_OFFSET, HOST, LView, RENDERER, SANITIZER} from '../interfaces/view';
import {getActiveDirectiveId, getActiveDirectiveSuperClassDepth, getActiveDirectiveSuperClassHeight, getLView, getSelectedIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/misc_utils';
import {getTNode, isStylingContext as isOldStylingContext} from '../util/view_utils';

import {applyClasses, applyStyles, registerBinding, updateClassBinding, updateStyleBinding} from './bindings';
import {TStylingContext} from './interfaces';
import {activeStylingMapFeature, normalizeIntoStylingMap} from './map_based_bindings';
import {getCurrentStyleSanitizer, setCurrentStyleSanitizer} from './state';
import {attachStylingDebugObject} from './styling_debug';
import {allocTStylingContext, getCurrentOrLViewSanitizer, hasValueChanged, updateContextDirectiveIndex} from './util';



/**
 * --------
 *
 * This file contains the core logic for how styling instructions are processed in Angular.
 *
 * To learn more about the algorithm see `TStylingContext`.
 *
 * --------
 */

/**
 * Temporary function to bridge styling functionality between this new
 * refactor (which is here inside of `styling_next/`) and the old
 * implementation (which lives inside of `styling/`).
 *
 * This function is executed during the creation block of an element.
 * Because the existing styling implementation issues a call to the
 * `styling()` instruction, this instruction will also get run. The
 * central idea here is that the directive index values are bound
 * into the context. The directive index is temporary and is only
 * required until the `select(n)` instruction is fully functional.
 */
export function stylingInit() {
  const lView = getLView();
  const index = getSelectedIndex();
  const tNode = getTNode(index, lView);
  updateLastDirectiveIndex(tNode, getActiveDirectiveStylingIndex());
}

/**
 * Sets the current style sanitizer function which will then be used
 * within all follow-up prop and map-based style binding instructions
 * for the given element.
 *
 * Note that once styling has been applied to the element (i.e. once
 * `select(n)` is executed or the hostBindings/template function exits)
 * then the active `sanitizerFn` will be set to `null`. This means that
 * once styling is applied to another element then a another call to
 * `styleSanitizer` will need to be made.
 *
 * @param sanitizerFn The sanitization function that will be used to
 *       process style prop/value entries.
 *
 * @codeGenApi
 */
export function styleSanitizer(sanitizer: Sanitizer | StyleSanitizeFn | null): void {
  setCurrentStyleSanitizer(sanitizer);
}

/**
 * Mirror implementation of the `styleProp()` instruction (found in `instructions/styling.ts`).
 */
export function styleProp(
    prop: string, value: string | number | String | null, suffix?: string | null): void {
  _stylingProp(prop, resolveStylePropValue(value, suffix), false);
}

/**
 * Mirror implementation of the `classProp()` instruction (found in `instructions/styling.ts`).
 */
export function classProp(className: string, value: boolean | null): void {
  _stylingProp(className, value, true);
}

/**
 * Shared function used to update a prop-based styling binding for an element.
 */
function _stylingProp(
    prop: string, value: boolean | number | String | string | null, isClassBased: boolean) {
  const index = getSelectedIndex();
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX]++;
  const tNode = getTNode(index, lView);
  const defer = getActiveDirectiveSuperClassHeight() > 0;
  if (isClassBased) {
    updateClassBinding(
        getClassesContext(tNode), lView, prop, bindingIndex, value as string | boolean | null,
        defer, false);
  } else {
    const sanitizer = getCurrentOrLViewSanitizer(lView);
    updateStyleBinding(
        getStylesContext(tNode), lView, prop, bindingIndex, value as string | null, sanitizer,
        defer, false);
  }
}

/**
 * Mirror implementation of the `styleMap()` instruction (found in `instructions/styling.ts`).
 */
export function styleMap(styles: {[styleName: string]: any} | NO_CHANGE | null): void {
  _stylingMap(styles, false);
}

/**
 * Mirror implementation of the `classMap()` instruction (found in `instructions/styling.ts`).
 */
export function classMap(classes: {[className: string]: any} | NO_CHANGE | string | null): void {
  _stylingMap(classes, true);
}

/**
 * Shared function used to update a map-based styling binding for an element.
 *
 * When this function is called it will activate support for `[style]` and
 * `[class]` bindings in Angular.
 */
function _stylingMap(value: {[key: string]: any} | string | null, isClassBased: boolean) {
  activeStylingMapFeature();
  const index = getSelectedIndex();
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX]++;

  if (value !== NO_CHANGE) {
    const tNode = getTNode(index, lView);
    const defer = getActiveDirectiveSuperClassHeight() > 0;
    const oldValue = lView[bindingIndex];
    const valueHasChanged = hasValueChanged(oldValue, value);
    const lStylingMap = normalizeIntoStylingMap(oldValue, value);
    if (isClassBased) {
      updateClassBinding(
          getClassesContext(tNode), lView, null, bindingIndex, lStylingMap, defer, valueHasChanged);
    } else {
      const sanitizer = getCurrentOrLViewSanitizer(lView);
      updateStyleBinding(
          getStylesContext(tNode), lView, null, bindingIndex, lStylingMap, sanitizer, defer,
          valueHasChanged);
    }
  }
}

/**
 * Temporary function to bridge styling functionality between this new
 * refactor (which is here inside of `styling_next/`) and the old
 * implementation (which lives inside of `styling/`).
 *
 * The new styling refactor ensures that styling flushing is called
 * automatically when a template function exits or a follow-up element
 * is visited (i.e. when `select(n)` is called). Because the `select(n)`
 * instruction is not fully implemented yet (it doesn't actually execute
 * host binding instruction code at the right time), this means that a
 * styling apply function is still needed.
 *
 * This function is a mirror implementation of the `stylingApply()`
 * instruction (found in `instructions/styling.ts`).
 */
export function stylingApply() {
  const index = getSelectedIndex();
  const lView = getLView();
  const tNode = getTNode(index, lView);
  const renderer = getRenderer(tNode, lView);
  const native = getNativeFromLView(index, lView);
  const directiveIndex = getActiveDirectiveStylingIndex();
  applyClasses(renderer, lView, getClassesContext(tNode), native, directiveIndex);

  const sanitizer = getCurrentOrLViewSanitizer(lView);
  applyStyles(renderer, lView, getStylesContext(tNode), native, directiveIndex, sanitizer);

  setCurrentStyleSanitizer(null);
}

/**
 * Temporary function to bridge styling functionality between this new
 * refactor (which is here inside of `styling_next/`) and the old
 * implementation (which lives inside of `styling/`).
 *
 * The purpose of this function is to traverse through the LView data
 * for a specific element index and return the native node. Because the
 * current implementation relies on there being a styling context array,
 * the code below will need to loop through these array values until it
 * gets a native element node.
 *
 * Note that this code is temporary and will disappear once the new
 * styling refactor lands in its entirety.
 */
function getNativeFromLView(index: number, viewData: LView): RElement {
  let storageIndex = index + HEADER_OFFSET;
  let slotValue: LContainer|LView|OldStylingContext|RElement = viewData[storageIndex];
  let wrapper: LContainer|LView|OldStylingContext = viewData;
  while (Array.isArray(slotValue)) {
    wrapper = slotValue;
    slotValue = slotValue[HOST] as LView | OldStylingContext | RElement;
  }
  if (isOldStylingContext(wrapper)) {
    return wrapper[OldStylingIndex.ElementPosition] as RElement;
  } else {
    return slotValue;
  }
}

function getRenderer(tNode: TNode, lView: LView) {
  return tNode.type === TNodeType.Element ? lView[RENDERER] : null;
}

/**
 * Searches and assigns provided all static style/class entries (found in the `attrs` value)
 * and registers them in their respective styling contexts.
 */
export function registerInitialStylingIntoContext(
    tNode: TNode, attrs: TAttributes, startIndex: number) {
  let classesContext !: TStylingContext;
  let stylesContext !: TStylingContext;
  let mode = -1;
  for (let i = startIndex; i < attrs.length; i++) {
    const attr = attrs[i];
    if (typeof attr == 'number') {
      mode = attr;
    } else if (mode == AttributeMarker.Classes) {
      classesContext = classesContext || getClassesContext(tNode);
      registerBinding(classesContext, -1, attr as string, true, false);
    } else if (mode == AttributeMarker.Styles) {
      stylesContext = stylesContext || getStylesContext(tNode);
      registerBinding(stylesContext, -1, attr as string, attrs[++i] as string, false);
    }
  }
}

/**
 * Mirror implementation of the same function found in `instructions/styling.ts`.
 */
export function getActiveDirectiveStylingIndex(): number {
  // whenever a directive's hostBindings function is called a uniqueId value
  // is assigned. Normally this is enough to help distinguish one directive
  // from another for the styling context, but there are situations where a
  // sub-class directive could inherit and assign styling in concert with a
  // parent directive. To help the styling code distinguish between a parent
  // sub-classed directive the inheritance depth is taken into account as well.
  return getActiveDirectiveId() + getActiveDirectiveSuperClassDepth();
}

/**
 * Temporary function that will update the max directive index value in
 * both the classes and styles contexts present on the provided `tNode`.
 *
 * This code is only used because the `select(n)` code functionality is not
 * yet 100% functional. The `select(n)` instruction cannot yet evaluate host
 * bindings function code in sync with the associated template function code.
 * For this reason the styling algorithm needs to track the last directive index
 * value so that it knows exactly when to render styling to the element since
 * `stylingApply()` is called multiple times per CD (`stylingApply` will be
 * removed once `select(n)` is fixed).
 */
function updateLastDirectiveIndex(tNode: TNode, directiveIndex: number) {
  updateContextDirectiveIndex(getClassesContext(tNode), directiveIndex);
  updateContextDirectiveIndex(getStylesContext(tNode), directiveIndex);
}

function getStylesContext(tNode: TNode): TStylingContext {
  return getContext(tNode, false);
}

function getClassesContext(tNode: TNode): TStylingContext {
  return getContext(tNode, true);
}

/**
 * Returns/instantiates a styling context from/to a `tNode` instance.
 */
function getContext(tNode: TNode, isClassBased: boolean) {
  let context = isClassBased ? tNode.newClasses : tNode.newStyles;
  if (!context) {
    context = allocTStylingContext();
    if (ngDevMode) {
      attachStylingDebugObject(context);
    }
    if (isClassBased) {
      tNode.newClasses = context;
    } else {
      tNode.newStyles = context;
    }
  }
  return context;
}

function resolveStylePropValue(
    value: string | number | String | null, suffix: string | null | undefined) {
  let resolvedValue: string|null = null;
  if (value !== null) {
    if (suffix) {
      // when a suffix is applied then it will bypass
      // sanitization entirely (b/c a new string is created)
      resolvedValue = renderStringify(value) + suffix;
    } else {
      // sanitization happens by dealing with a String value
      // this means that the string value will be passed through
      // into the style rendering later (which is where the value
      // will be sanitized before it is applied)
      resolvedValue = value as any as string;
    }
  }
  return resolvedValue;
}
