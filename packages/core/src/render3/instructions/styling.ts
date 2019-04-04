/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {TNode, TNodeType} from '../interfaces/node';
import {PlayerFactory} from '../interfaces/player';
import {FLAGS, HEADER_OFFSET, LViewFlags, RENDERER, RootContextFlags} from '../interfaces/view';
import {getActiveDirectiveId, getActiveDirectiveSuperClassDepth, getLView, getPreviousOrParentTNode, getSelectedIndex} from '../state';
import {getInitialClassNameValue, renderStyling, updateClassProp as updateElementClassProp, updateContextWithBindings, updateStyleProp as updateElementStyleProp, updateStylingMap} from '../styling/class_and_style_bindings';
import {ParamsOf, enqueueHostInstruction, registerHostDirective} from '../styling/host_instructions_queue';
import {BoundPlayerFactory} from '../styling/player_factory';
import {DEFAULT_TEMPLATE_DIRECTIVE_INDEX} from '../styling/shared';
import {allocateOrUpdateDirectiveIntoContext, createEmptyStylingContext, forceClassesAsString, forceStylesAsString, getStylingContext, hasClassInput, hasStyleInput} from '../styling/util';
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
 * - elementStyling
 * - elementStylingMap
 * - elementStyleProp
 * - elementClassProp
 * - elementStylingApply
 *
 * Host bindings level styling instructions:
 * - elementHostStyling
 * - elementHostStylingMap
 * - elementHostStyleProp
 * - elementHostClassProp
 * - elementHostStylingApply
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
 *        The `elementClassProp` instruction refers to the class name by index in
 *        this array (i.e. `['foo', 'bar']` means `foo=0` and `bar=1`).
 * @param styleBindingNames An array containing bindable style properties.
 *        The `elementStyleProp` instruction refers to the class name by index in
 *        this array (i.e. `['width', 'height']` means `width=0` and `height=1`).
 * @param styleSanitizer An optional sanitizer function that will be used to sanitize any CSS
 *        style values that are applied to the element (during rendering).
 *
 * @publicApi
 */
export function ΔelementStyling(
    classBindingNames?: string[] | null, styleBindingNames?: string[] | null,
    styleSanitizer?: StyleSanitizeFn | null): void {
  const tNode = getPreviousOrParentTNode();
  if (!tNode.stylingTemplate) {
    tNode.stylingTemplate = createEmptyStylingContext();
  }

  // calling the function below ensures that the template's binding values
  // are applied as the first set of bindings into the context. If any other
  // styling bindings are set on the same element (by directives and/or
  // components) then they will be applied at the end of the `elementEnd`
  // instruction (because directives are created first before styling is
  // executed for a new element).
  initElementStyling(
      tNode, classBindingNames, styleBindingNames, styleSanitizer,
      DEFAULT_TEMPLATE_DIRECTIVE_INDEX);
}

/**
 * Allocates style and class binding properties on the host element during creation mode
 * within the host bindings function of a directive or component.
 *
 * This instruction is meant to be called during creation mode to register all
 * dynamic style and class host bindings on the host element of a directive or
 * component. Note that this is only used for binding values (see `elementHostAttrs`
 * to learn how to assign static styling values to the host element).
 *
 * @param classBindingNames An array containing bindable class names.
 *        The `elementHostClassProp` instruction refers to the class name by index in
 *        this array (i.e. `['foo', 'bar']` means `foo=0` and `bar=1`).
 * @param styleBindingNames An array containing bindable style properties.
 *        The `elementHostStyleProp` instruction refers to the class name by index in
 *        this array (i.e. `['width', 'height']` means `width=0` and `height=1`).
 * @param styleSanitizer An optional sanitizer function that will be used to sanitize any CSS
 *        style values that are applied to the element (during rendering).
 *        Note that the sanitizer instance itself is tied to the provided `directive` and
 *        will not be used if the same property is assigned in another directive or
 *        on the element directly.
 *
 * @publicApi
 */
export function ΔelementHostStyling(
    classBindingNames?: string[] | null, styleBindingNames?: string[] | null,
    styleSanitizer?: StyleSanitizeFn | null): void {
  const tNode = getPreviousOrParentTNode();
  if (!tNode.stylingTemplate) {
    tNode.stylingTemplate = createEmptyStylingContext();
  }

  const directiveStylingIndex = getActiveDirectiveStylingIndex();

  // despite the binding being applied in a queue (below), the allocation
  // of the directive into the context happens right away. The reason for
  // this is to retain the ordering of the directives (which is important
  // for the prioritization of bindings).
  allocateOrUpdateDirectiveIntoContext(tNode.stylingTemplate, directiveStylingIndex);

  const fns = tNode.onElementCreationFns = tNode.onElementCreationFns || [];
  fns.push(() => {
    initElementStyling(
        tNode, classBindingNames, styleBindingNames, styleSanitizer, directiveStylingIndex);
    registerHostDirective(tNode.stylingTemplate !, directiveStylingIndex);
  });
}

function initElementStyling(
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
 * on the element with `elementStylingMap` or any static styles that are
 * present from when the element was created with `elementStyling`).
 *
 * Note that the styling element is updated as part of `elementStylingApply`.
 *
 * @param index Index of the element's with which styling is associated.
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `elementStyling`.
 * @param value New value to write (falsy to remove). Note that if a directive also
 *        attempts to write to the same binding value (via `elementHostStyleProp`)
 *        then it will only be able to do so if the binding value assigned via
 *        `elementStyleProp` is falsy (or doesn't exist at all).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 * @param forceOverride Whether or not to update the styling value immediately
 *        (despite the other bindings possibly having priority)
 *
 * @publicApi
 */
export function ΔelementStyleProp(
    index: number, styleIndex: number, value: string | number | String | PlayerFactory | null,
    suffix?: string | null, forceOverride?: boolean): void {
  const valueToAdd = resolveStylePropValue(value, suffix);
  updateElementStyleProp(
      getStylingContext(index + HEADER_OFFSET, getLView()), styleIndex, valueToAdd,
      DEFAULT_TEMPLATE_DIRECTIVE_INDEX, forceOverride);
}

/**
 * Update a host style binding value on the host element within a component/directive.
 *
 * If the style value is falsy then it will be removed from the host element
 * (or assigned a different value depending if there are any styles placed
 * on the same element with `elementHostStylingMap` or any static styles that
 * are present from when the element was patched with `elementHostStyling`).
 *
 * Note that the styling applied to the host element once
 * `elementHostStylingApply` is called.
 *
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `elementHostStyling`.
 * @param value New value to write (falsy to remove). The value may or may not
 *        be applied to the element depending on the template/component/directive
 *        prioritization (see `interfaces/styling.ts`)
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 * @param forceOverride Whether or not to update the styling value immediately
 *        (despite the other bindings possibly having priority)
 *
 * @publicApi
 */
export function ΔelementHostStyleProp(
    styleIndex: number, value: string | number | String | PlayerFactory | null,
    suffix?: string | null, forceOverride?: boolean): void {
  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  const hostElementIndex = getSelectedIndex();

  const lView = getLView();
  const stylingContext = getStylingContext(hostElementIndex + HEADER_OFFSET, lView);

  const valueToAdd = resolveStylePropValue(value, suffix);
  const args: ParamsOf<typeof updateElementStyleProp> =
      [stylingContext, styleIndex, valueToAdd, directiveStylingIndex, forceOverride];
  enqueueHostInstruction(stylingContext, directiveStylingIndex, updateElementStyleProp, args);
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
 * `elementStyling` within the creation block.
 *
 * @param index Index of the element's with which styling is associated.
 * @param classIndex Index of class to toggle. This index value refers to the
 *        index of the class in the class bindings array that was passed into
 *        `elementStyling` (which is meant to be called before this
 *        function is).
 * @param value A true/false value which will turn the class on or off.
 * @param forceOverride Whether or not this value will be applied regardless
 *        of where it is being set within the styling priority structure.
 *
 * @publicApi
 */
export function ΔelementClassProp(
    index: number, classIndex: number, value: boolean | PlayerFactory,
    forceOverride?: boolean): void {
  const input = (value instanceof BoundPlayerFactory) ?
      (value as BoundPlayerFactory<boolean|null>) :
      booleanOrNull(value);
  updateElementClassProp(
      getStylingContext(index + HEADER_OFFSET, getLView()), classIndex, input,
      DEFAULT_TEMPLATE_DIRECTIVE_INDEX, forceOverride);
}


/**
 * Update a class host binding for a directive's/component's host element within
 * the host bindings function.
 *
 * This instruction is meant to handle the `@HostBinding('class.foo')` case and,
 * therefore, the class binding itself must already be allocated using
 * `elementHostStyling` within the creation block.
 *
 * @param classIndex Index of class to toggle. This index value refers to the
 *        index of the class in the class bindings array that was passed into
 *        `elementHostStlying` (which is meant to be called before this
 *        function is).
 * @param value A true/false value which will turn the class on or off.
 * @param forceOverride Whether or not this value will be applied regardless
 *        of where it is being set within the stylings priority structure.
 *
 * @publicApi
 */
export function ΔelementHostClassProp(
    classIndex: number, value: boolean | PlayerFactory, forceOverride?: boolean): void {
  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  const hostElementIndex = getSelectedIndex();

  const lView = getLView();
  const stylingContext = getStylingContext(hostElementIndex + HEADER_OFFSET, lView);

  const input = (value instanceof BoundPlayerFactory) ?
      (value as BoundPlayerFactory<boolean|null>) :
      booleanOrNull(value);

  const args: ParamsOf<typeof updateElementClassProp> =
      [stylingContext, classIndex, input, directiveStylingIndex, forceOverride];
  enqueueHostInstruction(stylingContext, directiveStylingIndex, updateElementClassProp, args);
}

function booleanOrNull(value: any): boolean|null {
  if (typeof value === 'boolean') return value;
  return value ? true : null;
}


/**
 * Update style and/or class bindings using object literals on an element.
 *
 * This instruction is meant to apply styling via the `[style]="exp"` and `[class]="exp"` template
 * bindings. When styles/classes are applied to the element they will then be updated with
 * respect to any styles/classes set with `elementStyleProp` or `elementClassProp`. If any
 * styles or classes are set to falsy then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `elementStylingApply` is called.
 *
 * @param index Index of the element's with which styling is associated.
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * @publicApi
 */
export function ΔelementStylingMap(
    index: number, classes: {[key: string]: any} | string | NO_CHANGE | null,
    styles?: {[styleName: string]: any} | NO_CHANGE | null): void {
  const lView = getLView();
  const tNode = getTNode(index, lView);
  const stylingContext = getStylingContext(index + HEADER_OFFSET, lView);

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

  if (hasStyleInput(tNode) && styles !== NO_CHANGE) {
    const initialStyles = getInitialClassNameValue(stylingContext);
    const styleInputVal =
        (initialStyles.length ? (initialStyles + ' ') : '') + forceStylesAsString(styles);
    setInputsForProperty(lView, tNode.inputs !['style'] !, styleInputVal);
    styles = NO_CHANGE;
  }

  updateStylingMap(stylingContext, classes, styles);
}


/**
 * Update style and/or class host bindings using object literals on an element within the host
 * bindings function for a directive/component.
 *
 * This instruction is meant to apply styling via the `@HostBinding('style')` and
 * `@HostBinding('class')` bindings for a component's or directive's host element.
 * When styles/classes are applied to the host element they will then be updated
 * with respect to any styles/classes set with `elementHostStyleProp` or
 * `elementHostClassProp`. If any styles or classes are set to falsy then they
 * will be removed from the element.
 *
 * Note that the styling instruction will not be applied until
 * `elementHostStylingApply` is called.
 *
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * @publicApi
 */
export function ΔelementHostStylingMap(
    classes: {[key: string]: any} | string | NO_CHANGE | null,
    styles?: {[styleName: string]: any} | NO_CHANGE | null): void {
  const directiveStylingIndex = getActiveDirectiveStylingIndex();
  const hostElementIndex = getSelectedIndex();

  const lView = getLView();
  const stylingContext = getStylingContext(hostElementIndex + HEADER_OFFSET, lView);

  const args: ParamsOf<typeof updateStylingMap> =
      [stylingContext, classes, styles, directiveStylingIndex];
  enqueueHostInstruction(stylingContext, directiveStylingIndex, updateStylingMap, args);
}


/**
 * Apply all style and class binding values to the element.
 *
 * This instruction is meant to be run after `elementStylingMap`, `elementStyleProp`
 * or `elementClassProp` instructions have been run and will only apply styling to
 * the element if any styling bindings have been updated.
 *
 * @param index Index of the element's with which styling is associated.
 *
 * @publicApi
 */
export function ΔelementStylingApply(index: number): void {
  elementStylingApplyInternal(DEFAULT_TEMPLATE_DIRECTIVE_INDEX, index);
}

/**
 * Apply all style and class host binding values to the element.
 *
 * This instruction is meant to be run after `elementHostStylingMap`,
 * `elementHostStyleProp` or `elementHostClassProp` instructions have
 * been run and will only apply styling to the host element if any
 * styling bindings have been updated.
 *
 * @publicApi
 */
export function ΔelementHostStylingApply(): void {
  elementStylingApplyInternal(getActiveDirectiveStylingIndex(), getSelectedIndex());
}

export function elementStylingApplyInternal(directiveStylingIndex: number, index: number): void {
  const lView = getLView();
  const tNode = getTNode(index, lView);

  // if a non-element value is being processed then we can't render values
  // on the element at all therefore by setting the renderer to null then
  // the styling apply code knows not to actually apply the values...
  const renderer = tNode.type === TNodeType.Element ? lView[RENDERER] : null;
  const isFirstRender = (lView[FLAGS] & LViewFlags.FirstLViewPass) !== 0;
  const stylingContext = getStylingContext(index + HEADER_OFFSET, lView);
  const totalPlayersQueued = renderStyling(
      stylingContext, renderer, lView, isFirstRender, null, null, directiveStylingIndex);
  if (totalPlayersQueued > 0) {
    const rootContext = getRootContext(lView);
    scheduleTick(rootContext, RootContextFlags.FlushPlayers);
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
