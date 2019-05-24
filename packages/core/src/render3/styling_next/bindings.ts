/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn, StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {ProceduralRenderer3, RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';

import {ApplyStylingFn, LStylingData, LStylingMap, StylingMapsSyncMode, SyncStylingMapsFn, TStylingContext, TStylingContextIndex, TStylingContextPropConfigFlags} from './interfaces';
import {allowStylingFlush, getBindingValue, getGuardMask, getProp, getPropValuesStartPosition, getValuesCount, hasValueChanged, isContextLocked, isSanitizationRequired, isStylingValueDefined, lockContext, setGuardMask} from './util';


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

const DEFAULT_BINDING_VALUE = null;
const DEFAULT_SIZE_VALUE = 1;

// The first bit value reflects a map-based binding value's bit.
// The reason why it's always activated for every entry in the map
// is so that if any map-binding values update then all other prop
// based bindings will pass the guard check automatically without
// any extra code or flags.
export const DEFAULT_GUARD_MASK_VALUE = 0b1;
const STYLING_INDEX_FOR_MAP_BINDING = 0;
const STYLING_INDEX_START_VALUE = 1;

// the values below are global to all styling code below. Each value
// will either increment or mutate each time a styling instruction is
// executed. Do not modify the values below.
let currentStyleIndex = STYLING_INDEX_START_VALUE;
let currentClassIndex = STYLING_INDEX_START_VALUE;
let stylesBitMask = 0;
let classesBitMask = 0;
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
    context: TStylingContext, data: LStylingData, prop: string | null, bindingIndex: number,
    value: boolean | string | null | undefined | LStylingMap, deferRegistration: boolean,
    forceUpdate: boolean): void {
  const isMapBased = !prop;
  const index = isMapBased ? STYLING_INDEX_FOR_MAP_BINDING : currentClassIndex++;
  const updated = updateBindingData(
      context, data, index, prop, bindingIndex, value, deferRegistration, forceUpdate, false);
  if (updated || forceUpdate) {
    classesBitMask |= 1 << index;
  }
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
    context: TStylingContext, data: LStylingData, prop: string | null, bindingIndex: number,
    value: String | string | number | null | undefined | LStylingMap,
    sanitizer: StyleSanitizeFn | null, deferRegistration: boolean, forceUpdate: boolean): void {
  const isMapBased = !prop;
  const index = isMapBased ? STYLING_INDEX_FOR_MAP_BINDING : currentStyleIndex++;
  const sanitizationRequired = isMapBased ?
      true :
      (sanitizer ? sanitizer(prop !, null, StyleSanitizeMode.ValidateProperty) : false);
  const updated = updateBindingData(
      context, data, index, prop, bindingIndex, value, deferRegistration, forceUpdate,
      sanitizationRequired);
  if (updated || forceUpdate) {
    stylesBitMask |= 1 << index;
  }
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
    value: string | String | number | boolean | null | undefined | LStylingMap,
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
    bindingValue: number | null | string | boolean, sanitizationRequired?: boolean) {
  // prop-based bindings (e.g `<div [style.width]="w" [class.foo]="f">`)
  if (prop) {
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
    }
  } else {
    // map-based bindings (e.g `<div [style]="s" [class]="{className:true}">`)
    // there is no need to allocate the map-based binding region into the context
    // since it is already there when the context is first created.
    addBindingIntoContext(
        context, true, TStylingContextIndex.MapBindingsPosition, bindingValue, countId);
  }
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

  let lastValueIndex = index + TStylingContextIndex.BindingsStartOffset + valuesCount;
  if (!isMapBased) {
    // prop-based values all have default values, but map-based entries do not.
    // we want to access the index for the default value in this case and not just
    // the bindings...
    lastValueIndex--;
  }

  if (typeof bindingValue === 'number') {
    context.splice(lastValueIndex, 0, bindingValue);
    (context[index + TStylingContextIndex.ValuesCountOffset] as number)++;

    // now that a new binding index has been added to the property
    // the guard mask bit value (at the `countId` position) needs
    // to be included into the existing mask value.
    const guardMask = getGuardMask(context, index) | (1 << countId);
    setGuardMask(context, index, guardMask);
  } else if (typeof bindingValue === 'string' && context[lastValueIndex] == null) {
    context[lastValueIndex] = bindingValue;
  }
}

/**
 * Applies all class entries in the provided context to the provided element and resets
 * any counter and/or bitMask values associated with class bindings.
 *
 * @returns whether or not the classes were flushed to the element.
 */
export function applyClasses(
    renderer: Renderer3 | ProceduralRenderer3 | null, data: LStylingData, context: TStylingContext,
    element: RElement, directiveIndex: number): boolean {
  let classesFlushed = false;
  if (allowStylingFlush(context, directiveIndex)) {
    const isFirstPass = !isContextLocked(context);
    isFirstPass && lockContext(context);
    if (classesBitMask) {
      // there is no way to sanitize a class value therefore `sanitizer=null`
      applyStyling(context, renderer, element, data, classesBitMask, setClass, null);
      classesBitMask = 0;
      classesFlushed = true;
    }
    currentClassIndex = STYLING_INDEX_START_VALUE;
  }
  return classesFlushed;
}

/**
 * Applies all style entries in the provided context to the provided element and resets
 * any counter and/or bitMask values associated with style bindings.
 *
 * @returns whether or not the styles were flushed to the element.
 */
export function applyStyles(
    renderer: Renderer3 | ProceduralRenderer3 | null, data: LStylingData, context: TStylingContext,
    element: RElement, directiveIndex: number, sanitizer: StyleSanitizeFn | null): boolean {
  let stylesFlushed = false;
  if (allowStylingFlush(context, directiveIndex)) {
    const isFirstPass = !isContextLocked(context);
    isFirstPass && lockContext(context);
    if (stylesBitMask) {
      applyStyling(context, renderer, element, data, stylesBitMask, setStyle, sanitizer);
      stylesBitMask = 0;
      stylesFlushed = true;
    }
    currentStyleIndex = STYLING_INDEX_START_VALUE;
    return true;
  }
  return stylesFlushed;
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
 * will be applied as well. However, the code for that is not apart of
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
  deferredBindingQueue.length && flushDeferredBindings();

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
    (renderer: Renderer3 | null, native: any, prop: string, value: string | null) => {
      if (value) {
        // opacity, z-index and flexbox all have number values
        // and these need to be converted into strings so that
        // they can be assigned properly.
        value = value.toString();
        ngDevMode && ngDevMode.rendererSetStyle++;
        renderer && isProceduralRenderer(renderer) ?
            renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
            native.style.setProperty(prop, value);
      } else {
        ngDevMode && ngDevMode.rendererRemoveStyle++;
        renderer && isProceduralRenderer(renderer) ?
            renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
            native.style.removeProperty(prop);
      }
    };

/**
 * Adds/removes the provided className value to the provided element.
 */
const setClass: ApplyStylingFn =
    (renderer: Renderer3 | null, native: any, className: string, value: any) => {
      if (className !== '') {
        if (value) {
          ngDevMode && ngDevMode.rendererAddClass++;
          renderer && isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
                                                       native.classList.add(className);
        } else {
          ngDevMode && ngDevMode.rendererRemoveClass++;
          renderer && isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
                                                       native.classList.remove(className);
        }
      }
    };
