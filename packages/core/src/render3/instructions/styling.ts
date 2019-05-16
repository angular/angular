/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {assertEqual} from '../../util/assert';
import {TNode, TNodeType} from '../interfaces/node';
import {PlayerFactory} from '../interfaces/player';
import {FLAGS, HEADER_OFFSET, LView, LViewFlags, RENDERER, RootContextFlags} from '../interfaces/view';
import {getActiveDirectiveId, getActiveDirectiveSuperClassDepth, getLView, getPreviousOrParentTNode, getSelectedIndex} from '../state';
import {getInitialClassNameValue, renderStyling, updateClassMap, updateClassProp as updateclassProp, updateContextWithBindings, updateStyleMap, updateStyleProp as updatestyleProp} from '../styling/class_and_style_bindings';
import {ParamsOf, enqueueHostInstruction, registerHostDirective} from '../styling/host_instructions_queue';
import {BoundPlayerFactory} from '../styling/player_factory';
import {DEFAULT_TEMPLATE_DIRECTIVE_INDEX} from '../styling/shared';
import {getCachedStylingContext, setCachedStylingContext} from '../styling/state';
import {allocateOrUpdateDirectiveIntoContext, createEmptyStylingContext, forceClassesAsString, forceStylesAsString, getStylingContextFromLView, hasClassInput, hasStyleInput} from '../styling/util';
import {classMap as newClassMap, classProp as newClassProp, styleMap as newStyleMap, styleProp as newStyleProp, stylingApply as newStylingApply, stylingInit as newStylingInit} from '../styling_next/instructions';
import {runtimeAllowOldStyling, runtimeIsNewStylingInUse} from '../styling_next/state';
import {getBindingNameFromIndex} from '../styling_next/util';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/misc_utils';
import {getRootContext} from '../util/view_traversal_utils';
import {getTNode} from '../util/view_utils';

import {scheduleTick, setInputsForProperty} from './shared';



/*
 * The contents of this file include the instructions for all styling-related
 * operations in Angular.
 *
 * The instructions present in this file are:
 *
 * Template level styling instructions:
 * - styling
 * - styleMap
 * - classMap
 * - styleProp
 * - classProp
 * - stylingApply
 */

/**
 * Allocates style and class binding properties on the element during creation mode.
 *
 * This instruction is meant to be called during creation mode to register all
 * dynamic style and class bindings on the element. Note that this is only used
 * for binding values (see `elementStart` to learn how to assign static styling
 * values to an element).
 *
 * @param classBindingNames An array containing bindable class names.
 *        The `classProp` instruction refers to the class name by index in
 *        this array (i.e. `['foo', 'bar']` means `foo=0` and `bar=1`).
 * @param styleBindingNames An array containing bindable style properties.
 *        The `styleProp` instruction refers to the class name by index in
 *        this array (i.e. `['width', 'height']` means `width=0` and `height=1`).
 * @param styleSanitizer An optional sanitizer function that will be used to sanitize any CSS
 *        style values that are applied to the element (during rendering).
 *
 * Note that this will allocate the provided style/class bindings to the host element if
 * this function is called within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵstyling(
    classBindingNames?: string[] | null, styleBindingNames?: string[] | null,
    styleSanitizer?: StyleSanitizeFn | null): void {
  const tNode = getPreviousOrParentTNode();
  if (!tNode.stylingTemplate) {
    tNode.stylingTemplate = createEmptyStylingContext();
  }

  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  if (directiveStylingIndex) {
    // this is temporary hack to get the existing styling instructions to
    // play ball with the new refactored implementation.
    // TODO (matsko): remove this once the old implementation is not needed.
    if (runtimeIsNewStylingInUse()) {
      newStylingInit();
    }

    // despite the binding being applied in a queue (below), the allocation
    // of the directive into the context happens right away. The reason for
    // this is to retain the ordering of the directives (which is important
    // for the prioritization of bindings).
    allocateOrUpdateDirectiveIntoContext(tNode.stylingTemplate, directiveStylingIndex);

    const fns = tNode.onElementCreationFns = tNode.onElementCreationFns || [];
    fns.push(() => {
      initStyling(
          tNode, classBindingNames, styleBindingNames, styleSanitizer, directiveStylingIndex);
      registerHostDirective(tNode.stylingTemplate !, directiveStylingIndex);
    });
  } else {
    // calling the function below ensures that the template's binding values
    // are applied as the first set of bindings into the context. If any other
    // styling bindings are set on the same element (by directives and/or
    // components) then they will be applied at the end of the `elementEnd`
    // instruction (because directives are created first before styling is
    // executed for a new element).
    initStyling(
        tNode, classBindingNames, styleBindingNames, styleSanitizer,
        DEFAULT_TEMPLATE_DIRECTIVE_INDEX);
  }
}

function initStyling(
    tNode: TNode, classBindingNames: string[] | null | undefined,
    styleBindingNames: string[] | null | undefined,
    styleSanitizer: StyleSanitizeFn | null | undefined, directiveStylingIndex: number): void {
  updateContextWithBindings(
      tNode.stylingTemplate !, directiveStylingIndex, classBindingNames, styleBindingNames,
      styleSanitizer);
}


/**
 * Update a style binding on an element with the provided value.
 *
 * If the style value is falsy then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `styleMap` or any static styles that are
 * present from when the element was created with `styling`).
 *
 * Note that the styling element is updated as part of `stylingApply`.
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `styling`.
 * @param value New value to write (falsy to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 * @param forceOverride Whether or not to update the styling value immediately
 *        (despite the other bindings possibly having priority)
 *
 * Note that this will apply the provided style value to the host element if this function is called
 * within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵstyleProp(
    styleIndex: number, value: string | number | String | PlayerFactory | null,
    suffix?: string | null, forceOverride?: boolean): void {
  const index = getSelectedIndex();
  const valueToAdd = resolveStylePropValue(value, suffix);
  const stylingContext = getStylingContext(index, getLView());
  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  if (directiveStylingIndex) {
    const args: ParamsOf<typeof updatestyleProp> =
        [stylingContext, styleIndex, valueToAdd, directiveStylingIndex, forceOverride];
    enqueueHostInstruction(stylingContext, directiveStylingIndex, updatestyleProp, args);
  } else {
    updatestyleProp(
        stylingContext, styleIndex, valueToAdd, DEFAULT_TEMPLATE_DIRECTIVE_INDEX, forceOverride);
  }

  if (runtimeIsNewStylingInUse()) {
    const prop = getBindingNameFromIndex(stylingContext, styleIndex, directiveStylingIndex, false);

    // the reason why we cast the value as `boolean` is
    // because the new styling refactor does not yet support
    // sanitization or animation players.
    newStyleProp(prop, value as string | number, suffix);
  }
}

function resolveStylePropValue(
    value: string | number | String | PlayerFactory | null, suffix: string | null | undefined) {
  let valueToAdd: string|null = null;
  if (value !== null) {
    if (suffix) {
      // when a suffix is applied then it will bypass
      // sanitization entirely (b/c a new string is created)
      valueToAdd = renderStringify(value) + suffix;
    } else {
      // sanitization happens by dealing with a String value
      // this means that the string value will be passed through
      // into the style rendering later (which is where the value
      // will be sanitized before it is applied)
      valueToAdd = value as any as string;
    }
  }
  return valueToAdd;
}


/**
 * Update a class binding on an element with the provided value.
 *
 * This instruction is meant to handle the `[class.foo]="exp"` case and,
 * therefore, the class binding itself must already be allocated using
 * `styling` within the creation block.
 *
 * @param classIndex Index of class to toggle. This index value refers to the
 *        index of the class in the class bindings array that was passed into
 *        `styling` (which is meant to be called before this
 *        function is).
 * @param value A true/false value which will turn the class on or off.
 * @param forceOverride Whether or not this value will be applied regardless
 *        of where it is being set within the styling priority structure.
 *
 * Note that this will apply the provided class value to the host element if this function
 * is called within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵclassProp(
    classIndex: number, value: boolean | PlayerFactory, forceOverride?: boolean): void {
  const index = getSelectedIndex();
  const input = (value instanceof BoundPlayerFactory) ?
      (value as BoundPlayerFactory<boolean|null>) :
      booleanOrNull(value);
  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  const stylingContext = getStylingContext(index, getLView());
  if (directiveStylingIndex) {
    const args: ParamsOf<typeof updateclassProp> =
        [stylingContext, classIndex, input, directiveStylingIndex, forceOverride];
    enqueueHostInstruction(stylingContext, directiveStylingIndex, updateclassProp, args);
  } else {
    updateclassProp(
        stylingContext, classIndex, input, DEFAULT_TEMPLATE_DIRECTIVE_INDEX, forceOverride);
  }

  if (runtimeIsNewStylingInUse()) {
    const prop = getBindingNameFromIndex(stylingContext, classIndex, directiveStylingIndex, true);

    // the reason why we cast the value as `boolean` is
    // because the new styling refactor does not yet support
    // sanitization or animation players.
    newClassProp(prop, input as boolean);
  }
}


function booleanOrNull(value: any): boolean|null {
  if (typeof value === 'boolean') return value;
  return value ? true : null;
}


/**
 * Update style bindings using an object literal on an element.
 *
 * This instruction is meant to apply styling via the `[style]="exp"` template bindings.
 * When styles are applied to the element they will then be updated with respect to
 * any styles/classes set via `styleProp`. If any styles are set to falsy
 * then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 *
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * Note that this will apply the provided styleMap value to the host element if this function
 * is called within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵstyleMap(styles: {[styleName: string]: any} | NO_CHANGE | null): void {
  const index = getSelectedIndex();
  const lView = getLView();
  const stylingContext = getStylingContext(index, lView);
  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  if (directiveStylingIndex) {
    const args: ParamsOf<typeof updateStyleMap> = [stylingContext, styles, directiveStylingIndex];
    enqueueHostInstruction(stylingContext, directiveStylingIndex, updateStyleMap, args);
  } else {
    const tNode = getTNode(index, lView);

    // inputs are only evaluated from a template binding into a directive, therefore,
    // there should not be a situation where a directive host bindings function
    // evaluates the inputs (this should only happen in the template function)
    if (hasStyleInput(tNode) && styles !== NO_CHANGE) {
      const initialStyles = getInitialClassNameValue(stylingContext);
      const styleInputVal =
          (initialStyles.length ? (initialStyles + ' ') : '') + forceStylesAsString(styles);
      setInputsForProperty(lView, tNode.inputs !['style'] !, styleInputVal);
      styles = NO_CHANGE;
    }
    updateStyleMap(stylingContext, styles);
  }

  if (runtimeIsNewStylingInUse()) {
    newStyleMap(styles);
  }
}


/**
 * Update class bindings using an object literal or class-string on an element.
 *
 * This instruction is meant to apply styling via the `[class]="exp"` template bindings.
 * When classes are applied to the element they will then be updated with
 * respect to any styles/classes set via `classProp`. If any
 * classes are set to falsy then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 * Note that this will the provided classMap value to the host element if this function is called
 * within a host binding.
 *
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 *
 * @codeGenApi
 */
export function ɵɵclassMap(classes: {[styleName: string]: any} | NO_CHANGE | string | null): void {
  const index = getSelectedIndex();
  const lView = getLView();
  const stylingContext = getStylingContext(index, lView);
  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  if (directiveStylingIndex) {
    const args: ParamsOf<typeof updateClassMap> = [stylingContext, classes, directiveStylingIndex];
    enqueueHostInstruction(stylingContext, directiveStylingIndex, updateClassMap, args);
  } else {
    const tNode = getTNode(index, lView);
    // inputs are only evaluated from a template binding into a directive, therefore,
    // there should not be a situation where a directive host bindings function
    // evaluates the inputs (this should only happen in the template function)
    if (hasClassInput(tNode) && classes !== NO_CHANGE) {
      const initialClasses = getInitialClassNameValue(stylingContext);
      const classInputVal =
          (initialClasses.length ? (initialClasses + ' ') : '') + forceClassesAsString(classes);
      setInputsForProperty(lView, tNode.inputs !['class'] !, classInputVal);
      classes = NO_CHANGE;
    }
    updateClassMap(stylingContext, classes);
  }

  if (runtimeIsNewStylingInUse()) {
    newClassMap(classes);
  }
}

/**
 * Apply all style and class binding values to the element.
 *
 * This instruction is meant to be run after `styleMap`, `classMap`,
 * `styleProp` or `classProp` instructions have been run and will
 * only apply styling to the element if any styling bindings have been updated.
 *
 * @codeGenApi
 */
export function ɵɵstylingApply(): void {
  const index = getSelectedIndex();
  const directiveStylingIndex =
      getActiveDirectiveStylingIndex() || DEFAULT_TEMPLATE_DIRECTIVE_INDEX;
  const lView = getLView();
  const tNode = getTNode(index, lView);

  // if a non-element value is being processed then we can't render values
  // on the element at all therefore by setting the renderer to null then
  // the styling apply code knows not to actually apply the values...
  const renderer = tNode.type === TNodeType.Element ? lView[RENDERER] : null;
  const isFirstRender = (lView[FLAGS] & LViewFlags.FirstLViewPass) !== 0;
  const stylingContext = getStylingContext(index, lView);

  if (runtimeAllowOldStyling()) {
    const totalPlayersQueued = renderStyling(
        stylingContext, renderer, lView, isFirstRender, null, null, directiveStylingIndex);
    if (totalPlayersQueued > 0) {
      const rootContext = getRootContext(lView);
      scheduleTick(rootContext, RootContextFlags.FlushPlayers);
    }
  }

  // because select(n) may not run between every instruction, the cached styling
  // context may not get cleared between elements. The reason for this is because
  // styling bindings (like `[style]` and `[class]`) are not recognized as property
  // bindings by default so a select(n) instruction is not generated. To ensure the
  // context is loaded correctly for the next element the cache below is pre-emptively
  // cleared because there is no code in Angular that applies more styling code after a
  // styling flush has occurred. Note that this will be fixed once FW-1254 lands.
  setCachedStylingContext(null);

  if (runtimeIsNewStylingInUse()) {
    newStylingApply();
  }
}

export function getActiveDirectiveStylingIndex() {
  // whenever a directive's hostBindings function is called a uniqueId value
  // is assigned. Normally this is enough to help distinguish one directive
  // from another for the styling context, but there are situations where a
  // sub-class directive could inherit and assign styling in concert with a
  // parent directive. To help the styling code distinguish between a parent
  // sub-classed directive the inheritance depth is taken into account as well.
  return getActiveDirectiveId() + getActiveDirectiveSuperClassDepth();
}

function getStylingContext(index: number, lView: LView) {
  let context = getCachedStylingContext();
  if (!context) {
    context = getStylingContextFromLView(index + HEADER_OFFSET, lView);
    setCachedStylingContext(context);
  } else if (ngDevMode) {
    const actualContext = getStylingContextFromLView(index + HEADER_OFFSET, lView);
    assertEqual(context, actualContext, 'The cached styling context is invalid');
  }
  return context;
}
