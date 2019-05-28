/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn, StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {ProceduralRenderer3, RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';

import {ApplyStylingFn, LStylingData, StylingMapArray, StylingMapArrayIndex, StylingMapsSyncMode, SyncStylingMapsFn, TStylingContext, TStylingContextIndex, TStylingContextPropConfigFlags} from './interfaces';
import {BIT_MASK_START_VALUE, deleteStylingStateFromStorage, getStylingState, resetStylingState, storeStylingState} from './state';
import {allowStylingFlush, getBindingValue, getGuardMask, getMapProp, getMapValue, getProp, getPropValuesStartPosition, getStylingMapArray, getValuesCount, hasValueChanged, isContextLocked, isSanitizationRequired, isStylingValueDefined, lockContext, setGuardMask, stateIsPersisted} from './util';



/**
 * --------
 *
 * This file contains the core logic for styling in Angular.
 *
 * All styling bindings (i.e. `[style]`, `[style.prop]`, `[class]` and `[class.name]`)
 * will have their values be applied through the logic in this file.
 *
 * When a binding is encountered (e.g. `<div [style.width]="w">`) then
 * the binding data will be populated into a `TStylingContext` data-structure.
 * There is only one `TStylingContext` per `TNode` and each element instance
 * will update its style/class binding values in concert with the styling
 * context.
 *
 * To learn more about the algorithm see `TStylingContext`.
 *
 * --------
 */

// The first bit value reflects a map-based binding value's bit.
// The reason why it's always activated for every entry in the map
// is so that if any map-binding values update then all other prop
// based bindings will pass the guard check automatically without
// any extra code or flags.
export const DEFAULT_GUARD_MASK_VALUE = 0b1;

/**
 * The guard/update mask bit index location for map-based bindings.
 *
 * All map-based bindings (i.e. `[style]` and `[class]` )
 */
const STYLING_INDEX_FOR_MAP_BINDING = 0;

/**
 * Default fallback value for a styling binding.
 *
 * A value of `null` is used here which signals to the styling algorithm that
 * the styling value is not present. This way if there are no other values
 * detected then it will be removed once the style/class property is dirty and
 * diffed within the styling algorithm present in `flushStyling`.
 */
const DEFAULT_BINDING_VALUE = null;

/**
 * Default size count value for a new entry in a context.
 *
 * A value of `1` is used here because each entry in the context has a default
 * property.
 */
const DEFAULT_SIZE_VALUE = 1;

let deferredBindingQueue: (TStylingContext | number | string | null | boolean)[] = [];

/**
 * Visits a class-based binding and updates the new value (if changed).
 *
 * This function is called each time a class-based styling instruction
 * is executed. It's important that it's always called (even if the value
 * has not changed) so that the inner counter index value is incremented.
 * This way, each instruction is always guaranteed to get the same counter
 * state each time it's called (which then allows the `TStylingContext`
 * and the bit mask values to be in sync).
 */
export function updateClassBinding(
    context: TStylingContext, data: LStylingData, element: RElement, prop: string | null,
    bindingIndex: number, value: boolean | string | null | undefined | StylingMapArray,
    deferRegistration: boolean, forceUpdate: boolean): boolean {
  const isMapBased = !prop;
  const state = getStylingState(element, stateIsPersisted(context));
  const index = isMapBased ? STYLING_INDEX_FOR_MAP_BINDING : state.classesIndex++;
  const updated = updateBindingData(
      context, data, index, prop, bindingIndex, value, deferRegistration, forceUpdate, false);
  if (updated || forceUpdate) {
    // We flip the bit in the bitMask to reflect that the binding
    // at the `index` slot has changed. This identifies to the flushing
    // phase that the bindings for this particular CSS class need to be
    // applied again because on or more of the bindings for the CSS
    // class have changed.
    state.classesBitMask |= 1 << index;
    return true;
  }
  return false;
}

/**
 * Visits a style-based binding and updates the new value (if changed).
 *
 * This function is called each time a style-based styling instruction
 * is executed. It's important that it's always called (even if the value
 * has not changed) so that the inner counter index value is incremented.
 * This way, each instruction is always guaranteed to get the same counter
 * state each time it's called (which then allows the `TStylingContext`
 * and the bit mask values to be in sync).
 */
export function updateStyleBinding(
    context: TStylingContext, data: LStylingData, element: RElement, prop: string | null,
    bindingIndex: number, value: String | string | number | null | undefined | StylingMapArray,
    sanitizer: StyleSanitizeFn | null, deferRegistration: boolean, forceUpdate: boolean): boolean {
  const isMapBased = !prop;
  const state = getStylingState(element, stateIsPersisted(context));
  const index = isMapBased ? STYLING_INDEX_FOR_MAP_BINDING : state.stylesIndex++;
  const sanitizationRequired = isMapBased ?
      true :
      (sanitizer ? sanitizer(prop !, null, StyleSanitizeMode.ValidateProperty) : false);
  const updated = updateBindingData(
      context, data, index, prop, bindingIndex, value, deferRegistration, forceUpdate,
      sanitizationRequired);
  if (updated || forceUpdate) {
    // We flip the bit in the bitMask to reflect that the binding
    // at the `index` slot has changed. This identifies to the flushing
    // phase that the bindings for this particular property need to be
    // applied again because on or more of the bindings for the CSS
    // property have changed.
    state.stylesBitMask |= 1 << index;
    return true;
  }
  return false;
}

/**
 * Called each time a binding value has changed within the provided `TStylingContext`.
 *
 * This function is designed to be called from `updateStyleBinding` and `updateClassBinding`.
 * If called during the first update pass, the binding will be registered in the context.
 * If the binding does get registered and the `deferRegistration` flag is true then the
 * binding data will be queued up until the context is later flushed in `applyStyling`.
 *
 * This function will also update binding slot in the provided `LStylingData` with the
 * new binding entry (if it has changed).
 *
 * @returns whether or not the binding value was updated in the `LStylingData`.
 */
function updateBindingData(
    context: TStylingContext, data: LStylingData, counterIndex: number, prop: string | null,
    bindingIndex: number,
    value: string | String | number | boolean | null | undefined | StylingMapArray,
    deferRegistration: boolean, forceUpdate: boolean, sanitizationRequired: boolean): boolean {
  if (!isContextLocked(context)) {
    if (deferRegistration) {
      deferBindingRegistration(context, counterIndex, prop, bindingIndex, sanitizationRequired);
    } else {
      deferredBindingQueue.length && flushDeferredBindings();

      // this will only happen during the first update pass of the
      // context. The reason why we can't use `tNode.firstTemplatePass`
      // here is because its not guaranteed to be true when the first
      // update pass is executed (remember that all styling instructions
      // are run in the update phase, and, as a result, are no more
      // styling instructions that are run in the creation phase).
      registerBinding(context, counterIndex, prop, bindingIndex, sanitizationRequired);
    }
  }

  const changed = forceUpdate || hasValueChanged(data[bindingIndex], value);
  if (changed) {
    data[bindingIndex] = value;
  }
  return changed;
}

/**
 * Schedules a binding registration to be run at a later point.
 *
 * The reasoning for this feature is to ensure that styling
 * bindings are registered in the correct order for when
 * directives/components have a super/sub class inheritance
 * chains. Each directive's styling bindings must be
 * registered into the context in reverse order. Therefore all
 * bindings will be buffered in reverse order and then applied
 * after the inheritance chain exits.
 */
function deferBindingRegistration(
    context: TStylingContext, counterIndex: number, prop: string | null, bindingIndex: number,
    sanitizationRequired: boolean) {
  deferredBindingQueue.unshift(context, counterIndex, prop, bindingIndex, sanitizationRequired);
}

/**
 * Flushes the collection of deferred bindings and causes each entry
 * to be registered into the context.
 */
function flushDeferredBindings() {
  let i = 0;
  while (i < deferredBindingQueue.length) {
    const context = deferredBindingQueue[i++] as TStylingContext;
    const count = deferredBindingQueue[i++] as number;
    const prop = deferredBindingQueue[i++] as string;
    const bindingIndex = deferredBindingQueue[i++] as number | null;
    const sanitizationRequired = deferredBindingQueue[i++] as boolean;
    registerBinding(context, count, prop, bindingIndex, sanitizationRequired);
  }
  deferredBindingQueue.length = 0;
}

/**
 * Registers the provided binding (prop + bindingIndex) into the context.
 *
 * This function is shared between bindings that are assigned immediately
 * (via `updateBindingData`) and at a deferred stage. When called, it will
 * figure out exactly where to place the binding data in the context.
 *
 * It is needed because it will either update or insert a styling property
 * into the context at the correct spot.
 *
 * When called, one of two things will happen:
 *
 * 1) If the property already exists in the context then it will just add
 *    the provided `bindingValue` to the end of the binding sources region
 *    for that particular property.
 *
 *    - If the binding value is a number then it will be added as a new
 *      binding index source next to the other binding sources for the property.
 *
 *    - Otherwise, if the binding value is a string/boolean/null type then it will
 *      replace the default value for the property if the default value is `null`.
 *
 * 2) If the property does not exist then it will be inserted into the context.
 *    The styling context relies on all properties being stored in alphabetical
 *    order, so it knows exactly where to store it.
 *
 *    When inserted, a default `null` value is created for the property which exists
 *    as the default value for the binding. If the bindingValue property is inserted
 *    and it is either a string, number or null value then that will replace the default
 *    value.
 *
 * Note that this function is also used for map-based styling bindings. They are treated
 * much the same as prop-based bindings, but, because they do not have a property value
 * (since it's a map), all map-based entries are stored in an already populated area of
 * the context at the top (which is reserved for map-based entries).
 */
export function registerBinding(
    context: TStylingContext, countId: number, prop: string | null,
    bindingValue: number | null | string | boolean, sanitizationRequired?: boolean): boolean {
  let registered = false;
  if (prop) {
    // prop-based bindings (e.g `<div [style.width]="w" [class.foo]="f">`)
    let found = false;
    let i = getPropValuesStartPosition(context);
    while (i < context.length) {
      const valuesCount = getValuesCount(context, i);
      const p = getProp(context, i);
      found = prop <= p;
      if (found) {
        // all style/class bindings are sorted by property name
        if (prop < p) {
          allocateNewContextEntry(context, i, prop, sanitizationRequired);
        }
        addBindingIntoContext(context, false, i, bindingValue, countId);
        break;
      }
      i += TStylingContextIndex.BindingsStartOffset + valuesCount;
    }

    if (!found) {
      allocateNewContextEntry(context, context.length, prop, sanitizationRequired);
      addBindingIntoContext(context, false, i, bindingValue, countId);
      registered = true;
    }
  } else {
    // map-based bindings (e.g `<div [style]="s" [class]="{className:true}">`)
    // there is no need to allocate the map-based binding region into the context
    // since it is already there when the context is first created.
    addBindingIntoContext(
        context, true, TStylingContextIndex.MapBindingsPosition, bindingValue, countId);
    registered = true;
  }
  return registered;
}

function allocateNewContextEntry(
    context: TStylingContext, index: number, prop: string, sanitizationRequired?: boolean) {
  // 1,2: splice index locations
  // 3: each entry gets a config value (guard mask + flags)
  // 4. each entry gets a size value (which is always one because there is always a default binding
  // value)
  // 5. the property that is getting allocated into the context
  // 6. the default binding value (usually `null`)
  const config = sanitizationRequired ? TStylingContextPropConfigFlags.SanitizationRequired :
                                        TStylingContextPropConfigFlags.Default;
  context.splice(index, 0, config, DEFAULT_SIZE_VALUE, prop, DEFAULT_BINDING_VALUE);
  setGuardMask(context, index, DEFAULT_GUARD_MASK_VALUE);
}

/**
 * Inserts a new binding value into a styling property tuple in the `TStylingContext`.
 *
 * A bindingValue is inserted into a context during the first update pass
 * of a template or host bindings function. When this occurs, two things
 * happen:
 *
 * - If the bindingValue value is a number then it is treated as a bindingIndex
 *   value (a index in the `LView`) and it will be inserted next to the other
 *   binding index entries.
 *
 * - Otherwise the binding value will update the default value for the property
 *   and this will only happen if the default value is `null`.
 *
 * Note that this function also handles map-based bindings and will insert them
 * at the top of the context.
 */
function addBindingIntoContext(
    context: TStylingContext, isMapBased: boolean, index: number,
    bindingValue: number | string | boolean | null, countId: number) {
  const valuesCount = getValuesCount(context, index);

  const firstValueIndex = index + TStylingContextIndex.BindingsStartOffset;
  let lastValueIndex = firstValueIndex + valuesCount;
  if (!isMapBased) {
    // prop-based values all have default values, but map-based entries do not.
    // we want to access the index for the default value in this case and not just
    // the bindings...
    lastValueIndex--;
  }

  if (typeof bindingValue === 'number') {
    // the loop here will check to see if the binding already exists
    // for the property in the context. Why? The reason for this is
    // because the styling context is not "locked" until the first
    // flush has occurred. This means that if a repeated element
    // registers its styling bindings then it will register each
    // binding more than once (since its duplicated). This check
    // will prevent that from happening. Note that this only happens
    // when a binding is first encountered and not each time it is
    // updated.
    for (let i = firstValueIndex; i <= lastValueIndex; i++) {
      const indexAtPosition = context[i];
      if (indexAtPosition === bindingValue) return;
    }

    context.splice(lastValueIndex, 0, bindingValue);
    (context[index + TStylingContextIndex.ValuesCountOffset] as number)++;

    // now that a new binding index has been added to the property
    // the guard mask bit value (at the `countId` position) needs
    // to be included into the existing mask value.
    const guardMask = getGuardMask(context, index) | (1 << countId);
    setGuardMask(context, index, guardMask);
  } else if (bindingValue !== null && context[lastValueIndex] == null) {
    context[lastValueIndex] = bindingValue;
  }
}

/**
 * Applies all pending style and class bindings to the provided element.
 *
 * This function will attempt to flush styling via the provided `classesContext`
 * and `stylesContext` context values. This function is designed to be run from
 * the `stylingApply()` instruction (which is run at the very end of styling
 * change detection) and will rely on any state values that are set from when
 * any styling bindings update.
 *
 * This function may be called multiple times on the same element because it can
 * be called from the template code as well as from host bindings. In order for
 * styling to be successfully flushed to the element (which will only happen once
 * despite this being called multiple times), the following criteria must be met:
 *
 * - `flushStyling` is called from the very last directive that has styling for
 *    the element (see `allowStylingFlush()`).
 * - one or more bindings for classes or styles has updated (this is checked by
 *   examining the classes or styles bit mask).
 *
 * If the style and class values are successfully applied to the element then
 * the temporary state values for the element will be cleared. Otherwise, if
 * this did not occur then the styling state is persisted (see `state.ts` for
 * more information on how this works).
 */
export function flushStyling(
    renderer: Renderer3 | ProceduralRenderer3 | null, data: LStylingData,
    classesContext: TStylingContext | null, stylesContext: TStylingContext | null,
    element: RElement, directiveIndex: number, styleSanitizer: StyleSanitizeFn | null): void {
  ngDevMode && ngDevMode.flushStyling++;

  const persistState = classesContext ? stateIsPersisted(classesContext) :
                                        (stylesContext ? stateIsPersisted(stylesContext) : false);
  const allowFlushClasses = allowStylingFlush(classesContext, directiveIndex);
  const allowFlushStyles = allowStylingFlush(stylesContext, directiveIndex);

  // deferred bindings are bindings which are scheduled to register with
  // the context at a later point. These bindings can only registered when
  // the context will be 100% flushed to the element.
  if (deferredBindingQueue.length && (allowFlushClasses || allowFlushStyles)) {
    flushDeferredBindings();
  }

  const state = getStylingState(element, persistState);
  const classesFlushed = maybeApplyStyling(
      renderer, element, data, classesContext, allowFlushClasses, state.classesBitMask, setClass,
      null);
  const stylesFlushed = maybeApplyStyling(
      renderer, element, data, stylesContext, allowFlushStyles, state.stylesBitMask, setStyle,
      styleSanitizer);

  if (classesFlushed && stylesFlushed) {
    resetStylingState();
    if (persistState) {
      deleteStylingStateFromStorage(element);
    }
  } else if (persistState) {
    storeStylingState(element, state);
  }
}

function maybeApplyStyling(
    renderer: Renderer3 | ProceduralRenderer3 | null, element: RElement, data: LStylingData,
    context: TStylingContext | null, allowFlush: boolean, bitMask: number,
    styleSetter: ApplyStylingFn, styleSanitizer: any | null): boolean {
  if (allowFlush && context) {
    lockAndFinalizeContext(context);
    if (contextHasUpdates(context, bitMask)) {
      ngDevMode && (styleSanitizer ? ngDevMode.stylesApplied++ : ngDevMode.classesApplied++);
      applyStyling(context !, renderer, element, data, bitMask, styleSetter, styleSanitizer);
      return true;
    }
  }
  return allowFlush;
}

function contextHasUpdates(context: TStylingContext | null, bitMask: number) {
  return context && bitMask > BIT_MASK_START_VALUE;
}

/**
 * Locks the context (so no more bindings can be added) and also copies over initial class/style
 * values into their binding areas.
 *
 * There are two main actions that take place in this function:
 *
 * - Locking the context:
 *   Locking the context is required so that the style/class instructions know NOT to
 *   register a binding again after the first update pass has run. If a locking bit was
 *   not used then it would need to scan over the context each time an instruction is run
 *   (which is expensive).
 *
 * - Patching initial values:
 *   Directives and component host bindings may include static class/style values which are
 *   bound to the host element. When this happens, the styling context will need to be informed
 *   so it can use these static styling values as defaults when a matching binding is falsy.
 *   These initial styling values are read from the initial styling values slot within the
 *   provided `TStylingContext` (which is an instance of a `StylingMapArray`). This inner map will
 *   be updated each time a host binding applies its static styling values (via `elementHostAttrs`)
 *   so these values are only read at this point because this is the very last point before the
 *   first style/class values are flushed to the element.
 */
function lockAndFinalizeContext(context: TStylingContext): void {
  if (!isContextLocked(context)) {
    const initialValues = getStylingMapArray(context);
    if (initialValues) {
      updateInitialStylingOnContext(context, initialValues);
    }
    lockContext(context);
  }
}

/**
 * Runs through the provided styling context and applies each value to
 * the provided element (via the renderer) if one or more values are present.
 *
 * This function will iterate over all entries present in the provided
 * `TStylingContext` array (both prop-based and map-based bindings).-
 *
 * Each entry, within the `TStylingContext` array, is stored alphabetically
 * and this means that each prop/value entry will be applied in order
 * (so long as it is marked dirty in the provided `bitMask` value).
 *
 * If there are any map-based entries present (which are applied to the
 * element via the `[style]` and `[class]` bindings) then those entries
 * will be applied as well. However, the code for that is not a part of
 * this function. Instead, each time a property is visited, then the
 * code below will call an external function called `stylingMapsSyncFn`
 * and, if present, it will keep the application of styling values in
 * map-based bindings up to sync with the application of prop-based
 * bindings.
 *
 * Visit `styling_next/map_based_bindings.ts` to learn more about how the
 * algorithm works for map-based styling bindings.
 *
 * Note that this function is not designed to be called in isolation (use
 * `applyClasses` and `applyStyles` to actually apply styling values).
 */
export function applyStyling(
    context: TStylingContext, renderer: Renderer3 | ProceduralRenderer3 | null, element: RElement,
    bindingData: LStylingData, bitMaskValue: number | boolean, applyStylingFn: ApplyStylingFn,
    sanitizer: StyleSanitizeFn | null) {
  const bitMask = normalizeBitMaskValue(bitMaskValue);
  const stylingMapsSyncFn = getStylingMapsSyncFn();
  const mapsGuardMask = getGuardMask(context, TStylingContextIndex.MapBindingsPosition);
  const applyAllValues = (bitMask & mapsGuardMask) > 0;
  const mapsMode =
      applyAllValues ? StylingMapsSyncMode.ApplyAllValues : StylingMapsSyncMode.TraverseValues;

  let i = getPropValuesStartPosition(context);
  while (i < context.length) {
    const valuesCount = getValuesCount(context, i);
    const guardMask = getGuardMask(context, i);
    if (bitMask & guardMask) {
      let valueApplied = false;
      const prop = getProp(context, i);
      const valuesCountUpToDefault = valuesCount - 1;
      const defaultValue = getBindingValue(context, i, valuesCountUpToDefault) as string | null;

      // case 1: apply prop-based values
      // try to apply the binding values and see if a non-null
      // value gets set for the styling binding
      for (let j = 0; j < valuesCountUpToDefault; j++) {
        const bindingIndex = getBindingValue(context, i, j) as number;
        const value = bindingData[bindingIndex];
        if (isStylingValueDefined(value)) {
          const finalValue = sanitizer && isSanitizationRequired(context, i) ?
              sanitizer(prop, value, StyleSanitizeMode.SanitizeOnly) :
              value;
          applyStylingFn(renderer, element, prop, finalValue, bindingIndex);
          valueApplied = true;
          break;
        }
      }

      // case 2: apply map-based values
      // traverse through each map-based styling binding and update all values up to
      // the provided `prop` value. If the property was not applied in the loop above
      // then it will be attempted to be applied in the maps sync code below.
      if (stylingMapsSyncFn) {
        // determine whether or not to apply the target property or to skip it
        const mode = mapsMode | (valueApplied ? StylingMapsSyncMode.SkipTargetProp :
                                                StylingMapsSyncMode.ApplyTargetProp);
        const valueAppliedWithinMap = stylingMapsSyncFn(
            context, renderer, element, bindingData, applyStylingFn, sanitizer, mode, prop,
            defaultValue);
        valueApplied = valueApplied || valueAppliedWithinMap;
      }

      // case 3: apply the default value
      // if the value has not yet been applied then a truthy value does not exist in the
      // prop-based or map-based bindings code. If and when this happens, just apply the
      // default value (even if the default value is `null`).
      if (!valueApplied) {
        applyStylingFn(renderer, element, prop, defaultValue);
      }
    }

    i += TStylingContextIndex.BindingsStartOffset + valuesCount;
  }

  // the map-based styling entries may have not applied all their
  // values. For this reason, one more call to the sync function
  // needs to be issued at the end.
  if (stylingMapsSyncFn) {
    stylingMapsSyncFn(context, renderer, element, bindingData, applyStylingFn, sanitizer, mapsMode);
  }
}

function normalizeBitMaskValue(value: number | boolean): number {
  // if pass => apply all values (-1 implies that all bits are flipped to true)
  if (value === true) return -1;

  // if pass => skip all values
  if (value === false) return 0;

  // return the bit mask value as is
  return value;
}

let _activeStylingMapApplyFn: SyncStylingMapsFn|null = null;
export function getStylingMapsSyncFn() {
  return _activeStylingMapApplyFn;
}

export function setStylingMapsSyncFn(fn: SyncStylingMapsFn) {
  _activeStylingMapApplyFn = fn;
}

/**
 * Assigns a style value to a style property for the given element.
 */
const setStyle: ApplyStylingFn =
    (renderer: Renderer3 | null, native: RElement, prop: string, value: string | null) => {
      // the reason why this may be `null` is either because
      // it's a container element or it's a part of a test
      // environment that doesn't have styling. In either
      // case it's safe not to apply styling to the element.
      const nativeStyle = native.style;
      if (value) {
        // opacity, z-index and flexbox all have number values
        // and these need to be converted into strings so that
        // they can be assigned properly.
        value = value.toString();
        ngDevMode && ngDevMode.rendererSetStyle++;
        renderer && isProceduralRenderer(renderer) ?
            renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
            (nativeStyle && nativeStyle.setProperty(prop, value));
      } else {
        ngDevMode && ngDevMode.rendererRemoveStyle++;
        renderer && isProceduralRenderer(renderer) ?
            renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
            (nativeStyle && nativeStyle.removeProperty(prop));
      }
    };

/**
 * Adds/removes the provided className value to the provided element.
 */
const setClass: ApplyStylingFn =
    (renderer: Renderer3 | null, native: RElement, className: string, value: any) => {
      if (className !== '') {
        // the reason why this may be `null` is either because
        // it's a container element or it's a part of a test
        // environment that doesn't have styling. In either
        // case it's safe not to apply styling to the element.
        const classList = native.classList;
        if (value) {
          ngDevMode && ngDevMode.rendererAddClass++;
          renderer && isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
                                                       (classList && classList.add(className));
        } else {
          ngDevMode && ngDevMode.rendererRemoveClass++;
          renderer && isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
                                                       (classList && classList.remove(className));
        }
      }
    };

/**
 * Iterates over all provided styling entries and renders them on the element.
 *
 * This function is used alongside a `StylingMapArray` entry. This entry is not
 * the same as the `TStylingContext` and is only really used when an element contains
 * initial styling values (e.g. `<div style="width:200px">`), but no style/class bindings
 * are present. If and when that happens then this function will be called to render all
 * initial styling values on an element.
 */
export function renderStylingMap(
    renderer: Renderer3, element: RElement, stylingValues: TStylingContext | StylingMapArray | null,
    isClassBased: boolean): void {
  const stylingMapArr = getStylingMapArray(stylingValues);
  if (stylingMapArr) {
    for (let i = StylingMapArrayIndex.ValuesStartPosition; i < stylingMapArr.length;
         i += StylingMapArrayIndex.TupleSize) {
      const prop = getMapProp(stylingMapArr, i);
      const value = getMapValue(stylingMapArr, i);
      if (isClassBased) {
        setClass(renderer, element, prop, value, null);
      } else {
        setStyle(renderer, element, prop, value, null);
      }
    }
  }
}

/**
 * Registers all initial styling entries into the provided context.
 *
 * This function will iterate over all entries in the provided `initialStyling` ar}ray and register
 * them as default (initial) values in the provided context. Initial styling values in a context are
 * the default values that are to be applied unless overwritten by a binding.
 *
 * The reason why this function exists and isn't a part of the context construction is because
 * host binding is evaluated at a later stage after the element is created. This means that
 * if a directive or component contains any initial styling code (i.e. `<div class="foo">`)
 * then that initial styling data can only be applied once the styling for that element
 * is first applied (at the end of the update phase). Once that happens then the context will
 * update itself with the complete initial styling for the element.
 */
function updateInitialStylingOnContext(
    context: TStylingContext, initialStyling: StylingMapArray): void {
  // `-1` is used here because all initial styling data is not a spart
  // of a binding (since it's static)
  const INITIAL_STYLING_COUNT_ID = -1;

  for (let i = StylingMapArrayIndex.ValuesStartPosition; i < initialStyling.length;
       i += StylingMapArrayIndex.TupleSize) {
    const value = getMapValue(initialStyling, i);
    if (value) {
      const prop = getMapProp(initialStyling, i);
      registerBinding(context, INITIAL_STYLING_COUNT_ID, prop, value, false);
    }
  }
}
