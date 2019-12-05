/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {TNode, TNodeFlags} from '../interfaces/node';
import {TDataStylingFlags} from '../interfaces/styling';
import {TData} from '../interfaces/view';
import {getBindingPropName, getNextBindingIndex, getPreviousBindingIndex, getStylingHead, getStylingTail, hasInitialClass, hasInitialStyle, hasInitialStyling, isComponentHostBinding, patchConfig, setBindingConfig, setBindingPointer, setBindingProp, setStylingHeadTail} from '../util/styling_utils';

import {StylingState} from './state';



/**
 * --------
 *
 * This file contains the logic for registering style/class bindings into a `TData` instance in
 * Angular.
 *
 * To learn more about the algorithm see `instructions/styling.ts`.
 *
 * --------
 */

/**
 * Registers the provided style/class binding so that it can be applied to an element when the
 * binding value changes.
 *
 * This function will register the provided style/class binding onto the provided `tData` array
 * (which is where all the style/class bindings live). It will also mark the associated `tNode`
 * flags to identify what types of style/class bindings are currently active (e.g. template
 * bindings, host class bindings, class map bindings, etc...).
 *
 * See [registerBindingIntoTData] for more info.
 */
export function registerBinding(
    tNode: TNode, tData: TData, bindingIndex: number, state: StylingState, prop: string | null,
    suffix: string | null, sanitizer: StyleSanitizeFn | null, isClassBased: boolean): void {
  const mode = getBindingSourceMode(tNode, state.directiveIndex);
  registerBindingIntoTData(
      tNode, tData, prop, bindingIndex, isClassBased, state, sanitizer, suffix, mode);

  let flagsToUpdate = prop === null ?
      (isClassBased ? TNodeFlags.hasClassMapBindings : TNodeFlags.hasStyleMapBindings) :
      (isClassBased ? TNodeFlags.hasClassPropBindings : TNodeFlags.hasStylePropBindings);

  flagsToUpdate |= mode !== BindingSourceMode.Template ?
      (isClassBased ? TNodeFlags.hasHostClassBindings : TNodeFlags.hasHostStyleBindings) :
      (isClassBased ? TNodeFlags.hasTemplateClassBindings : TNodeFlags.hasTemplateStyleBindings);

  patchConfig(tNode, flagsToUpdate);
}

/**
 * Determines the mode that the binding is being applied in
 */
function getBindingSourceMode(tNode: TNode, directiveIndex: number) {
  if (directiveIndex === 0) return BindingSourceMode.Template;
  const hasComponentOnHost = tNode.flags & TNodeFlags.isComponentHost;
  return directiveIndex === 1 && hasComponentOnHost ? BindingSourceMode.Component :
                                                      BindingSourceMode.Directive;
}

/**
 * Simple enum used to express what mode the bindings are being applied in
 */
const enum BindingSourceMode {
  /**
   * Template-based bindings (e.g. `<div [style.width]>`)
   */
  Template = 0,

  /**
   * Component-based host bindings (e.g. `@HostBinding('style.width')`)
   */
  Component = 1,

  /**
   * Directive-based host bindings (e.g. `@HostBinding('style.width')`)
   */
  Directive = 2,
}

/**
 * Registers the provided style/class binding into the associated tData array.
 *
 * All style/class bindings are registered into the `TData` array (which is apart
 * of the associated `TView`). The `TData` array mirrors the same structure as an
 * `LView` instance. By registering style/class binding information into the
 * `TData` array, the `LView` can have matching index values. This means the
 * data can easily be connected between the definition (in `TData`) and the
 * storage (in `LView`).
 *
 * Each style/class binding entry in the `TData` array consists of the property
 * and a 32-bit number which contains configuration flags, and two "pointer values".
 * These two "pointer values" are index values that point to the previous and
 * and next style/class binding indices. By having the previous and next values,
 * the styling algorithm is able to scan backwards from the last style/class
 * binding all the way to the first binding (the head binding) or scan all
 * the way until the end (the tail binding).
 *
 * Once a binding is registered, the provided `TNode` will be updated with a
 * reference to that binding value (i.e. the last style or class binding index).
 *
 * Let's imagine, for example, we have the following HTML code:
 *
 * ```html
 * <div [style]="s" [style.opacity]="o">
 * ```
 *
 * Our `TData` array (for styles) would look like so:
 *
 * ```
 * tData = [
 *   //...
 *
 *   // index 20 (in tData)
 *   {prop: null, suffix: null}, // the [style] binding
 *   22, // points to the next binding
 *
 *   // index 22
 *   'opacity', // the [style] binding
 *   20, // points to the previous binding (no next binding)
 * ]
 * ```
 *
 * Now let's imagine a binding of `[style.width.px]` is added:
 *
 * ```
 * tData = [
 *   //...
 *
 *   // index 20 (in tData)
 *   {prop: null, suffix: null}, // the [style] binding
 *   22, // points to the next binding
 *
 *   // index 22
 *   'opacity', // the [style] binding
 *   20 | 24, // points to the previous binding (no next binding)
 *
 *   // index 24
 *   {prop: 'width', suffix: 'px'},
 *   22,
 * ]
 * ```
 *
 * Note that the numeric previous/next value also contains various configuration flags
 * which are used to mark if the binding needs to be sanitized and if its a host binding
 * or not (see `interfaces/styling.ts` for more info).
 *
 * See `interfaces/styling.ts` to learn more about what configuration flags are
 * used for styling within `TData`.
 */
export function registerBindingIntoTData(
    tNode: TNode, tData: TData, prop: string | null, bindingIndex: number, isClassBased: boolean,
    state: StylingState, sanitizer: StyleSanitizeFn | null, suffix: string | null,
    mode: BindingSourceMode): void {
  const hostBindingsMode = mode > 0;
  let head = getStylingHead(tNode, isClassBased);
  let tail = getStylingTail(tNode, isClassBased);
  let sourceTail = isClassBased ? state.sourceClassTail : state.sourceStyleTail;
  let sourceHead = isClassBased ? state.sourceClassHead : state.sourceStyleHead;
  const isFirstBindingInSource = sourceHead === 0;
  sourceHead = sourceHead || head;
  sourceTail = sourceTail || tail;
  let previousPointer = 0;
  let nextPointer = 0;

  // when the source changes (where the bindings come from on the same element),
  // then we need to make sure that each of the bindings are situated before the
  // already registered bindings.
  if (isFirstBindingInSource) {
    if (isComponentHostBinding(tData, head)) {
      // all follow-up directives are placed after the component host bindings
      const lastComponentIndex = findEndOfComponentBindings(tData, head);
      nextPointer = getNextBindingIndex(tData, lastComponentIndex);
      previousPointer = lastComponentIndex;
      sourceTail = sourceHead = bindingIndex;
    } else {
      nextPointer = sourceHead;
      sourceHead = bindingIndex;
      head = bindingIndex;
    }
  } else {
    nextPointer = getNextBindingIndex(tData, sourceTail);
    previousPointer = sourceTail;
  }

  sourceTail = bindingIndex;

  // if the next index points to a template index then we
  // are in the first batch of host bindings. If it doesn't
  // point to anything at all then we are processing template bindings
  tail = nextPointer === 0 ? bindingIndex : tail;
  setStylingHeadTail(tNode, head, tail, isClassBased);

  // set for this binding
  setBindingProp(tData, bindingIndex, prop, suffix, sanitizer, isClassBased);
  setBindingConfigAndPointers(tData, bindingIndex, nextPointer, previousPointer, mode);

  // depending on where this binding is set, we want each entry to be in order
  // of styling priority. Therefore the bindings will change their order when
  // host bindings run
  if (nextPointer !== 0) {
    setBindingPointer(tData, nextPointer, bindingIndex, true);
  }

  if (previousPointer !== 0) {
    setBindingPointer(tData, previousPointer, bindingIndex, false);
  }

  if (isClassBased) {
    state.sourceClassHead = sourceHead;
    state.sourceClassTail = sourceTail;
  } else {
    state.sourceStyleHead = sourceHead;
    state.sourceStyleTail = sourceTail;
  }

  checkAndMarkBindingAsDuplicate(tNode, tData, prop, bindingIndex, isClassBased, hostBindingsMode);
}

function findEndOfComponentBindings(tData: TData, index: number): number {
  let endIndex = 0;
  while (index !== 0 && isComponentHostBinding(tData, index)) {
    endIndex = index;
    index = getNextBindingIndex(tData, index);
  }
  return endIndex;
}

/**
 * Checks to see if the provided property is a duplicate and then flags any adjacent bindings.
 *
 * The styling algorithm does as much as possible to detect whether a binding
 * can be applied to an element without the need to search/replace any other
 * values out of the final style/class string value. One mechanism to prevent
 * this search/replace behavior is to detect whether or not there are any
 * duplicates.
 *
 * When a new styling binding is inserted into a `TData` instance, the new
 * binding itself and/or any adjacent bindings need to be flagged as being
 * "duplicate" so that the algorithm knows to search/replace any new binding
 * entries for that specific properties when they come in.
 *
 * A binding is considered to be a "duplicate" binding if and when:
 * - It conflicts with any previously defined property binding:
 *    (e.g. `<div [style.width]="w" dir-that-sets-width></div>`)
 * - It conflicts with a matching initial styling value:
 *    (e.g. `<div class="foo" [class.foo]="f"></div>`)
 * - It conflicts with any previously defined map-based binding
 *    (e.g. `<div [style]="s" [style.width]="w"></div>`)
 *
 * If and when a duplicate is detected the function below will flag the
 * binding configuration data (which is inside of the `TData`) with a flag
 * stating that it is a duplicate.
 *
 * If a binding is inserted before any other existing bindings (i.e. when
 * host bindings are added to `TData` which already contains template bindings)
 * then all previously defined bindings will also be flagged as duplicate
 * if any of the cases above match.
 */
function checkAndMarkBindingAsDuplicate(
    tNode: TNode, tData: TData, prop: string | null, bindingIndex: number, isClassBased: boolean,
    hostBindingsMode: boolean): void {
  const isMapBasedBinding = prop === null;
  let targetBindingIsDuplicate = false;

  // Case #1: see if this binding overlaps with any bindings that exist
  //          in the styling chain before this one.
  if (hostBindingsMode) {
    // this can only happen when the target prop is being registered from
    // a directive.
    let i = getPreviousBindingIndex(tData, bindingIndex);
    while (i !== 0 && !targetBindingIsDuplicate) {
      const p = getBindingPropName(tData, i);
      targetBindingIsDuplicate = isMapBasedBinding || p === null || p === prop;
      i = getPreviousBindingIndex(tData, i);
    }
  }

  if (!targetBindingIsDuplicate && hasInitialStyling(tNode, isClassBased)) {
    targetBindingIsDuplicate = isMapBasedBinding ?
        true  // map-based values conflict with everything
        :
        (isClassBased ? hasInitialClass(tNode, prop !) : hasInitialStyle(tNode, prop !));
  }

  if (targetBindingIsDuplicate) {
    setBindingConfig(tData, bindingIndex, TDataStylingFlags.IsDuplicateBinding);
  }

  // Case #2: see if any bindings that show up after this binding conflict with it.
  //          There are two sub cases to take note of here:
  //            1) if map-based then flag all successive bindings as duplicate
  //            2) if prop-based then flag only the matching binding as duplicate
  if (hostBindingsMode) {
    let i = getNextBindingIndex(tData, bindingIndex);
    let allBindingsMatched = false;
    while (i !== 0 && !allBindingsMatched) {
      if (isMapBasedBinding || getBindingPropName(tData, i) === prop) {
        // note that we mark the OTHER binding indices (not the binding index
        // provided in this function). We are marking all follow-up binding
        // as being duplicate bindings because of the introduction of this
        // new binding
        setBindingConfig(tData, i, TDataStylingFlags.IsDuplicateBinding);
        allBindingsMatched = isMapBasedBinding ? false : true;
      }
      i = getNextBindingIndex(tData, i);
    }
  }
}

/**
 * Registers the the configuration and next/previous pointer values for a styling binding
 *
 * @param tData the `TData` array used to house the values
 * @param bindingIndex the index location where the values will be stored
 * @param nextIndex the next style/class binding in `TData` that this binding links to
 * @param previousIndex the previous style/class binding in `TData` that this binding links to
 * @param sanitizationRequired whether or not sanitization is required for this binding
 * @param hostBindingsMode whether or not this binding is a host binding
 */
export function setBindingConfigAndPointers(
    tData: TData, bindingIndex: number, nextIndex: number, previousIndex: number,
    mode: BindingSourceMode): void {
  tData[bindingIndex + 1] = TDataStylingFlags.Initial;
  if (mode === BindingSourceMode.Directive) {
    setBindingConfig(tData, bindingIndex, TDataStylingFlags.IsDirectiveHostBinding);
  } else if (mode === BindingSourceMode.Component) {
    setBindingConfig(tData, bindingIndex, TDataStylingFlags.IsComponentHostBinding);
  }

  if (previousIndex !== 0) {
    setBindingPointer(tData, bindingIndex, previousIndex, true);
  }
  if (nextIndex !== 0) {
    setBindingPointer(tData, bindingIndex, nextIndex, false);
  }
}
