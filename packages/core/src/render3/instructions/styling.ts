/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {SafeValue} from '../../sanitization/bypass';
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {TNode} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {RENDERER, TVIEW} from '../interfaces/view';
import {getActiveDirectiveId, getCheckNoChangesMode, getCurrentStyleSanitizer, getLView, getSelectedIndex, resetCurrentStyleSanitizer, setCurrentStyleSanitizer, setElementExitFn} from '../state';
import {registerBinding} from '../styling/binding_registration';
import {flushBindings, updateBindingValue} from '../styling/direct_write_algorithm';
import {getStylingState, resetStylingState} from '../styling/state';
import {NO_CHANGE} from '../tokens';
import {checkStylingValueNoChanges, getValue, hasDirectiveInput, isHostStylingActive, isSanitizationRequired, nextStylingBindingIndex, updateDirectiveInputValue} from '../util/styling_utils';
import {getNativeByTNode, getTNode} from '../util/view_utils';



/**
 * --------
 *
 * This file contains the core instructions for styling in Angular.
 *
 * Styling in Angular refers to any style/class bindings that are applied
 * to an element.
 *
 * Examples of styling in Angular include:
 *
 * ```html
 * <!-- specific style property bindings -->
 * <div [style.width]="myWidth">
 *
 * <!-- specific class property bindings -->
 * <div [class.foo]="myFoo" [class.bar]="myBar">
 *
 * <!-- multiple class and style property bindings -->
 * <div [class]="myClasses">
 * <div [style]="myStyles">
 *
 * <!-- classes and styles set via host bindings on directives -->
 * <div dir-that-sets-width dir-that-sets-height>
 * ```
 *
 * Style and class bindings in Angular are more complex than other bindings
 * because the style/class values need to be merged together in a set way.
 * For unique style/class bindings (i.e. bindings that are not a duplicate
 * of another style/class binding), the values will be applied as expected.
 * However, for any duplicate style/class bindings that are applied from
 * multiple sources (e.g. `<div [style.width] dir-that-sets-width>`), the
 * styling algorithm will need to decide which value to apply first. For
 * this situation, Angular has a style/class binding prioritization
 * mechanism (which means that certain style/class bindings will override other
 * bindings depending on where they are set (the binding source)).
 *
 * The list below breaks down which style/class bindings will have higher
 * precedence over others:
 * - Template bindings
 *    - property bindings (e.g. `[style.width]` or `[class.foo]`)
 *    - map-based bindings (e.g. `[style]` or `[class]`)
 * - Directive host bindings
 *    - property bindings (e.g. `@HostBinding('style.width')` or `@HostBinding('class.foo')`)
 *    - map-based bindings (e.g. `@HostBinding('style')` or `@HostBinding('class')`)
 * - Initial (inline) style/class bindings (e.g. `<div class="initial" style="width:100px">`)
 *
 * When the compiler comes across any style/class bindings, the template and host
 * bindings code is generated into a series of style/class binding instructions.
 * j
 * There are currently four different types of styling bindings. The list below
 * outlines each one:
 * - styleProp()  // property-based style bindings (i.e. `[style.width]="w"`)
 * - styleMap()   // map-based style bindings (i.e. `[style]="{...}"`)
 * - classProp()  // property-based class bindings (i.e. `[class.loading]="yesLoading"`)
 * - classMap()   // map-based class bindings (i.e. `[class]="'one two three'"`)
 *
 * ## Binding Registration
 *
 * The very first time any of these bindings are executed, they will register
 * themselves into the element's `TData` array. Each style/class entry in
 * that array will contain the following information:
 *
 * ```typescript
 * tData = [
 *   // entry one (e.g. `[style.width]`)
 *   'width',    // the property name
 *   XXXXXX,     // the configuration and pointer data for this binding
 * ]
 * ```
 *
 * The property name is stored so that it doesn't have to be parsed and normalized
 * each time a binding runs. If a map-based binding is registered then the property
 * value will be set to `null` (this way the algorithm knows when its dealing with
 * a map-based value or a prop-based value).
 *
 * The "configuration and pointer" value is a numeric value of 32 bits containing
 * the following information:
 *
 * ```
 * // see `interfaces/styling.ts` for the exact bit-for-bit breakdown of this value
 * PREVIOUS_BINDING_INDEX | NEXT_BINDING_INDEX | CONFIGURATION_BITS
 * ```
 *
 * The previous and next binding index values help link all style or class binding
 * entries together so that algorithm knows which binding entries to process and
 * when.
 *
 * ## Style/Class Binding Application
 *
 * Each time one of the instructions above executes, the provided style/class
 * binding information is "queued" to be set to the element. The actual style/class
 * values are not yet set on the element until a "styling flush" is executed.
 *
 * A "styling flush" will occur automatically when:
 * - The change detection for an element finishes (e.g. `advance()` is called
 *   or the template function finishes).
 * - All host bindings for an element are processed.
 *
 * Once a styling flush happens, the algorithm will obtain the final style/className
 * value and apply that to the element. The final style/className value is a
 * concatenated string value of each style or class binding.
 *
 * Let's imagine we have the following HTML code:
 *
 * ```html
 * <div style="width:200px" [style.opacity]="o" [style.color]="c">
 * <div class="foo" [class.foo]="myFoo" [class]="'bar baz'">
 * ```
 *
 * Here are some examples of the final values that will be applied:
 * - When `opacity=0.5` and `color='red'`
 *   => `width:200px; opacity:0.5; color: red`
 * - When `opacity=null` and `color='blue'`
 *   => `width:200px; color: red`
 * - When `foo=true`
 *   => `foo bar baz`
 * - When `foo=false`
 *   => `bar baz`
 *
 * See `styling/direct_write_algorithm.ts` for more information.
 *
 * --------
 */


/**
 * Sets the current style sanitizer function which will then be used
 * within all follow-up prop and map-based style binding instructions
 * for the given element.
 *
 * Note that once styling has been applied to the element (i.e. once
 * `advance(n)` is executed or the hostBindings/template function exits)
 * then the active `sanitizerFn` will be set to `null`. This means that
 * once styling is applied to another element then a another call to
 * `styleSanitizer` will need to be made.
 *
 * @param sanitizerFn The sanitization function that will be used to
 *       process style prop/value entries.
 *
 * @codeGenApi
 */
export function ɵɵstyleSanitizer(sanitizer: StyleSanitizeFn | null): void {
  setCurrentStyleSanitizer(sanitizer);
}

/**
 * Update a style binding on an element with the provided value.
 *
 * If the style value is falsy then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `styleMap` or any static styles that are
 * present from when the element was created with `styling`).
 *
 * Note that the styling element is updated once change detection has exited
 * the current element (i.e. either when `advance()` is called or when the
 * template/hostBindings code exits).
 *
 * Note that this will apply the provided style value to the host element
 * if this function is called within a host binding.
 *
 * @param prop A valid CSS property.
 * @param value New value to write (`null` or an empty string to remove).
 * @param suffix Optional suffix. Used with scalar values to add units such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 *
 * @codeGenApi
 */
export function ɵɵstyleProp(
    prop: string, value: string | number | SafeValue | null,
    suffix?: string | null): typeof ɵɵstyleProp {
  stylingBindingInternal(getSelectedIndex(), prop, value, suffix || null, false);
  return ɵɵstyleProp;
}

/**
 * Update a class binding on an element with the provided value.
 *
 * This instruction will toggle a specific CSS class on the element.
 *
 * Note that the styling element is updated once change detection has exited
 * the current element (i.e. either when `advance()` is called or when the
 * template/hostBindings code exits).
 *
 * Note that this will apply the provided class value to the host element
 * if this function is called within a host binding.
 *
 * @param className A valid CSS class (only one).
 * @param value A true/false value which will turn the class on or off.
 *
 * @codeGenApi
 */
export function ɵɵclassProp(className: string, value: boolean | null): typeof ɵɵclassProp {
  stylingBindingInternal(getSelectedIndex(), className, value, null, true);
  return ɵɵclassProp;
}

/**
 * Update style bindings using an object literal on an element.
 *
 * This instruction is meant to apply styling via the `[style]="exp"` template bindings.
 * When styles are applied to the element they will then be updated with respect to
 * any styles/classes set via `styleProp`. If any styles are set to falsy
 * then they will be removed from the element.
 *
 * Note that the styling element is updated once change detection has exited
 * the current element (i.e. either when `advance()` is called or when the
 * template/hostBindings code exits).
 *
 * Note that this will apply the provided style values to the host element
 * if this function is called within a host binding.
 *
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * @codeGenApi
 */
export function ɵɵstyleMap(styles: {[styleName: string]: any} | NO_CHANGE | null): void {
  stylingBindingInternal(getSelectedIndex(), null, styles, null, false);
}

/**
 * Update class bindings using an object literal or class-string on an element.
 *
 * This instruction is meant to apply styling via the `[class]="exp"` template bindings.
 * When classes are applied to the element they will then be updated with
 * respect to any styles/classes set via `classProp`. If any
 * classes are set to falsy then they will be removed from the element.
 *
 * Note that the styling element is updated once change detection has exited
 * the current element (i.e. either when `advance()` is called or when the
 * template/hostBindings code exits).
 *
 * Note that this will apply the provided class values to the host element
 * if this function is called within a host binding.
 *
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 *
 * @codeGenApi
 */
export function ɵɵclassMap(classes: {[className: string]: any} | NO_CHANGE | string | null): void {
  stylingBindingInternal(getSelectedIndex(), null, classes, null, true);
}

/**
 * Applies the provided `[style]`, `[style.prop]`, `[class]` or `[class.name]` binding.
 *
 * This function will also register the binding on the associated `TData` data-structure
 * (which is obtained from the current global `LView` instance) if this function is called
 * during the `firstUpdatePass`.
 */
export function stylingBindingInternal(
    elementIndex: number, prop: string | null, value: any, suffix: string | null,
    isClassBased: boolean): void {
  const lView = getLView();
  const tNode = getTNode(elementIndex, lView);
  const bindingIndex = nextStylingBindingIndex();
  const tView = lView[TVIEW];
  const firstUpdatePass = tView.firstUpdatePass;
  let updated = false;

  // map-based [style] and [class] properties are always delegated to a directive
  // if that directive has any `@Input('class')` or `@Input('style')` inputs.
  // This basically means that the directive will intercept said input values.
  // Note that this only happens for template-level properties (and not host
  // bindings).
  if (bindingBelongsToDirectiveInput(tNode, prop, isClassBased)) {
    updateDirectiveInputValue(lView, tNode, bindingIndex, value, isClassBased, firstUpdatePass);
  } else {
    const tData = tView.data;
    const directiveIndex = getActiveDirectiveId();
    const native = getNativeByTNode(tNode, lView) as RElement;
    const state = getStylingState(native, directiveIndex);

    if (firstUpdatePass) {
      const sanitizationRequired = isSanitizationRequired(prop, isClassBased);
      registerBinding(
          tNode, tData, bindingIndex, state, prop, suffix, sanitizationRequired, isHostStyling(),
          isClassBased);
    }

    if (ngDevMode && getCheckNoChangesMode()) {
      checkStylingValueNoChanges(prop, getValue(lView, bindingIndex), value);
    }

    updated = updateBindingValue(lView, tData, state, value, bindingIndex, isClassBased);
    if (updated) {
      // style/class bindings are not flushed to the element until the element
      // has processed all style/class bindings. For this reason we need to
      // schedule a "flush styling" operation to run once the element has
      // fully exited out of change detection.
      setElementExitFn(flushStyling);
    }
  }

  if (ngDevMode) {
    updateDevModeCounters(ngDevMode, updated, prop === null, isClassBased);
  }
}

/**
 * Flushes all styling code to the element.
 *
 * This function is designed to be scheduled from any of the four styling instructions
 * in this file. When called it will flush all style and class bindings to the element
 * via the context resolution algorithm.
 */
function flushStyling(): void {
  ngDevMode && ngDevMode.flushStyling++;
  const lView = getLView();
  const tView = lView[TVIEW];
  const elementIndex = getSelectedIndex();
  const tNode = getTNode(elementIndex, lView);
  const native = getNativeByTNode(tNode, lView) as RElement;
  const directiveIndex = getActiveDirectiveId();
  const state = getStylingState(native, directiveIndex);
  const sanitizer = getCurrentStyleSanitizer();
  const renderer = lView[RENDERER];
  const tData = tView.data;
  const hostBindingsMode = isHostStyling();
  flushBindings(
      renderer, native, lView, tNode, tData, state, sanitizer, tView.firstUpdatePass,
      hostBindingsMode);
  resetStylingState();
  resetCurrentStyleSanitizer();
}

/**
 * Whether or not the style/class binding being applied was executed within a host bindings
 * function.
 */
function isHostStyling(): boolean {
  return isHostStylingActive(getActiveDirectiveId());
}

/**
 * Whether or not a binding belongs to a directive input value present on the provided `TNode`.
 *
 * Some directives (such as `ngClass`) may grab ahold of teh `style` or `class` input
 * values. If and when this is true, the algorithm should defer the values directly to
 * those inputs. This function helps determine whether that should be done.
 *
 * @returns true when the style or class binding belongs to a directive input value.
 */
function bindingBelongsToDirectiveInput(
    tNode: TNode, prop: string | null, isClassBased: boolean): boolean {
  return prop === null && !isHostStyling() && hasDirectiveInput(tNode, isClassBased);
}

/**
 * Increments various ngDevMode counters when a style/class value is updated
 */
function updateDevModeCounters(
    devMode: NgDevModePerfCounters, wasUpdated: boolean, isMapBased: boolean,
    isClassBased: boolean): void {
  if (isMapBased) {
    isClassBased ? devMode.classMap : devMode.styleMap++;
    if (wasUpdated) {
      isClassBased ? devMode.classMapCacheMiss : devMode.styleMapCacheMiss++;
    }
  } else {
    isClassBased ? devMode.classProp : devMode.styleProp++;
    if (wasUpdated) {
      isClassBased ? devMode.classPropCacheMiss : devMode.stylePropCacheMiss++;
    }
  }
}
