/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {SafeValue, unwrapSafeValue} from '../../sanitization/bypass';
import {StyleSanitizeFn, StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {ProceduralRenderer3, RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {ApplyStylingFn, LStylingData, StylingMapArray, StylingMapArrayIndex, StylingMapsSyncMode, SyncStylingMapsFn, TStylingConfig, TStylingContext, TStylingContextIndex, TStylingContextPropConfigFlags} from '../interfaces/styling';
import {NO_CHANGE} from '../tokens';
import {DEFAULT_BINDING_INDEX, DEFAULT_BINDING_VALUE, DEFAULT_GUARD_MASK_VALUE, MAP_BASED_ENTRY_PROP_NAME, getBindingValue, getConfig, getDefaultValue, getGuardMask, getMapProp, getMapValue, getProp, getPropValuesStartPosition, getStylingMapArray, getTotalSources, getValue, getValuesCount, hasConfig, hasValueChanged, isContextLocked, isHostStylingActive, isSanitizationRequired, isStylingValueDefined, lockContext, patchConfig, setDefaultValue, setGuardMask, setMapAsDirty, setValue} from '../util/styling_utils';

import {getStylingState, resetStylingState} from './state';



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

/**
 * The guard/update mask bit index location for map-based bindings.
 *
 * All map-based bindings (i.e. `[style]` and `[class]` )
 */
const STYLING_INDEX_FOR_MAP_BINDING = 0;

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
export function updateClassViaContext(
    context: TStylingContext, data: LStylingData, element: RElement, directiveIndex: number,
    prop: string | null, bindingIndex: number,
    value: boolean | string | null | undefined | StylingMapArray | NO_CHANGE,
    forceUpdate?: boolean): boolean {
  const isMapBased = !prop;
  const state = getStylingState(element, directiveIndex);
  const countIndex = isMapBased ? STYLING_INDEX_FOR_MAP_BINDING : state.classesIndex++;
  if (value !== NO_CHANGE) {
    const updated = updateBindingData(
        context, data, countIndex, state.sourceIndex, prop, bindingIndex, value, forceUpdate,
        false);
    if (updated || forceUpdate) {
      // We flip the bit in the bitMask to reflect that the binding
      // at the `index` slot has changed. This identifies to the flushing
      // phase that the bindings for this particular CSS class need to be
      // applied again because on or more of the bindings for the CSS
      // class have changed.
      state.classesBitMask |= 1 << countIndex;
      return true;
    }
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
export function updateStyleViaContext(
    context: TStylingContext, data: LStylingData, element: RElement, directiveIndex: number,
    prop: string | null, bindingIndex: number,
    value: string | number | SafeValue | null | undefined | StylingMapArray | NO_CHANGE,
    sanitizer: StyleSanitizeFn | null, forceUpdate?: boolean): boolean {
  const isMapBased = !prop;
  const state = getStylingState(element, directiveIndex);
  const countIndex = isMapBased ? STYLING_INDEX_FOR_MAP_BINDING : state.stylesIndex++;
  if (value !== NO_CHANGE) {
    const sanitizationRequired = isMapBased ?
        true :
        (sanitizer ? sanitizer(prop !, null, StyleSanitizeMode.ValidateProperty) : false);
    const updated = updateBindingData(
        context, data, countIndex, state.sourceIndex, prop, bindingIndex, value, forceUpdate,
        sanitizationRequired);
    if (updated || forceUpdate) {
      // We flip the bit in the bitMask to reflect that the binding
      // at the `index` slot has changed. This identifies to the flushing
      // phase that the bindings for this particular property need to be
      // applied again because on or more of the bindings for the CSS
      // property have changed.
      state.stylesBitMask |= 1 << countIndex;
      return true;
    }
  }
  return false;
}

/**
 * Called each time a binding value has changed within the provided `TStylingContext`.
 *
 * This function is designed to be called from `updateStyleBinding` and `updateClassBinding`.
 * If called during the first update pass, the binding will be registered in the context.
 *
 * This function will also update binding slot in the provided `LStylingData` with the
 * new binding entry (if it has changed).
 *
 * @returns whether or not the binding value was updated in the `LStylingData`.
 */
function updateBindingData(
    context: TStylingContext, data: LStylingData, counterIndex: number, sourceIndex: number,
    prop: string | null, bindingIndex: number,
    value: string | SafeValue | number | boolean | null | undefined | StylingMapArray,
    forceUpdate?: boolean, sanitizationRequired?: boolean): boolean {
  const hostBindingsMode = isHostStylingActive(sourceIndex);
  if (!isContextLocked(context, hostBindingsMode)) {
    // this will only happen during the first update pass of the
    // context. The reason why we can't use `tNode.firstTemplatePass`
    // here is because its not guaranteed to be true when the first
    // update pass is executed (remember that all styling instructions
    // are run in the update phase, and, as a result, are no more
    // styling instructions that are run in the creation phase).
    registerBinding(context, counterIndex, sourceIndex, prop, bindingIndex, sanitizationRequired);
    patchConfig(
        context,
        hostBindingsMode ? TStylingConfig.HasHostBindings : TStylingConfig.HasTemplateBindings);
    patchConfig(context, prop ? TStylingConfig.HasPropBindings : TStylingConfig.HasMapBindings);
  }

  const changed = forceUpdate || hasValueChanged(data[bindingIndex], value);
  if (changed) {
    setValue(data, bindingIndex, value);
    const doSetValuesAsStale = (getConfig(context) & TStylingConfig.HasHostBindings) &&
        !hostBindingsMode && (prop ? !value : true);
    if (doSetValuesAsStale) {
      renderHostBindingsAsStale(context, data, prop);
    }
  }
  return changed;
}

/**
 * Iterates over all host-binding values for the given `prop` value in the context and sets their
 * corresponding binding values to `null`.
 *
 * Whenever a template binding changes its value to `null`, all host-binding values should be
 * re-applied
 * to the element when the host bindings are evaluated. This may not always happen in the event
 * that none of the bindings changed within the host bindings code. For this reason this function
 * is expected to be called each time a template binding becomes falsy or when a map-based template
 * binding changes.
 */
function renderHostBindingsAsStale(
    context: TStylingContext, data: LStylingData, prop: string | null): void {
  const valuesCount = getValuesCount(context);

  if (prop !== null && hasConfig(context, TStylingConfig.HasPropBindings)) {
    const itemsPerRow = TStylingContextIndex.BindingsStartOffset + valuesCount;

    let i = TStylingContextIndex.ValuesStartPosition;
    let found = false;
    while (i < context.length) {
      if (getProp(context, i) === prop) {
        found = true;
        break;
      }
      i += itemsPerRow;
    }

    if (found) {
      const bindingsStart = i + TStylingContextIndex.BindingsStartOffset;
      const valuesStart = bindingsStart + 1;  // the first column is template bindings
      const valuesEnd = bindingsStart + valuesCount - 1;

      for (let i = valuesStart; i < valuesEnd; i++) {
        const bindingIndex = context[i] as number;
        if (bindingIndex !== 0) {
          setValue(data, bindingIndex, null);
        }
      }
    }
  }

  if (hasConfig(context, TStylingConfig.HasMapBindings)) {
    const bindingsStart =
        TStylingContextIndex.ValuesStartPosition + TStylingContextIndex.BindingsStartOffset;
    const valuesStart = bindingsStart + 1;  // the first column is template bindings
    const valuesEnd = bindingsStart + valuesCount - 1;
    for (let i = valuesStart; i < valuesEnd; i++) {
      const stylingMap = getValue<StylingMapArray>(data, context[i] as number);
      if (stylingMap) {
        setMapAsDirty(stylingMap);
      }
    }
  }
}

/**
 * Registers the provided binding (prop + bindingIndex) into the context.
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
 * much the same as prop-based bindings, but, their property name value is set as `[MAP]`.
 */
export function registerBinding(
    context: TStylingContext, countId: number, sourceIndex: number, prop: string | null,
    bindingValue: number | null | string | boolean, sanitizationRequired?: boolean): void {
  let found = false;
  prop = prop || MAP_BASED_ENTRY_PROP_NAME;

  let totalSources = getTotalSources(context);

  // if a new source is detected then a new column needs to be allocated into
  // the styling context. The column is basically a new allocation of binding
  // sources that will be available to each property.
  while (totalSources <= sourceIndex) {
    addNewSourceColumn(context);
    totalSources++;
  }

  const isBindingIndexValue = typeof bindingValue === 'number';
  const entriesPerRow = TStylingContextIndex.BindingsStartOffset + getValuesCount(context);
  let i = TStylingContextIndex.ValuesStartPosition;

  // all style/class bindings are sorted by property name
  while (i < context.length) {
    const p = getProp(context, i);
    if (prop <= p) {
      if (prop < p) {
        allocateNewContextEntry(context, i, prop, sanitizationRequired);
      } else if (isBindingIndexValue) {
        patchConfig(context, TStylingConfig.HasCollisions);
      }
      addBindingIntoContext(context, i, bindingValue, countId, sourceIndex);
      found = true;
      break;
    }
    i += entriesPerRow;
  }

  if (!found) {
    allocateNewContextEntry(context, context.length, prop, sanitizationRequired);
    addBindingIntoContext(context, i, bindingValue, countId, sourceIndex);
  }
}

/**
 * Inserts a new row into the provided `TStylingContext` and assigns the provided `prop` value as
 * the property entry.
 */
function allocateNewContextEntry(
    context: TStylingContext, index: number, prop: string, sanitizationRequired?: boolean): void {
  const config = sanitizationRequired ? TStylingContextPropConfigFlags.SanitizationRequired :
                                        TStylingContextPropConfigFlags.Default;
  context.splice(
      index, 0,
      config,                    // 1) config value
      DEFAULT_GUARD_MASK_VALUE,  // 2) template bit mask
      DEFAULT_GUARD_MASK_VALUE,  // 3) host bindings bit mask
      prop,                      // 4) prop value (e.g. `width`, `myClass`, etc...)
      );

  index += 4;  // the 4 values above

  // 5...) default binding index for the template value
  // depending on how many sources already exist in the context,
  // multiple default index entries may need to be inserted for
  // the new value in the context.
  const totalBindingsPerEntry = getTotalSources(context);
  for (let i = 0; i < totalBindingsPerEntry; i++) {
    context.splice(index, 0, DEFAULT_BINDING_INDEX);
    index++;
  }

  // 6) default binding value for the new entry
  context.splice(index, 0, DEFAULT_BINDING_VALUE);
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
 */
function addBindingIntoContext(
    context: TStylingContext, index: number, bindingValue: number | string | boolean | null,
    bitIndex: number, sourceIndex: number) {
  if (typeof bindingValue === 'number') {
    const hostBindingsMode = isHostStylingActive(sourceIndex);
    const cellIndex = index + TStylingContextIndex.BindingsStartOffset + sourceIndex;
    context[cellIndex] = bindingValue;
    const updatedBitMask = getGuardMask(context, index, hostBindingsMode) | (1 << bitIndex);
    setGuardMask(context, index, updatedBitMask, hostBindingsMode);
  } else if (bindingValue !== null && getDefaultValue(context, index) === null) {
    setDefaultValue(context, index, bindingValue);
  }
}

/**
 * Registers a new column into the provided `TStylingContext`.
 *
 * If and when a new source is detected then a new column needs to
 * be allocated into the styling context. The column is basically
 * a new allocation of binding sources that will be available to each
 * property.
 *
 * Each column that exists in the styling context resembles a styling
 * source. A styling source an either be the template or one or more
 * components or directives all containing styling host bindings.
 */
function addNewSourceColumn(context: TStylingContext): void {
  // we use -1 here because we want to insert right before the last value (the default value)
  const insertOffset = TStylingContextIndex.BindingsStartOffset + getValuesCount(context) - 1;

  let index = TStylingContextIndex.ValuesStartPosition;
  while (index < context.length) {
    index += insertOffset;
    context.splice(index++, 0, DEFAULT_BINDING_INDEX);

    // the value was inserted just before the default value, but the
    // next entry in the context starts just after it. Therefore++.
    index++;
  }
  context[TStylingContextIndex.TotalSourcesPosition]++;
}

/**
 * Applies all pending style and class bindings to the provided element.
 *
 * This function will attempt to flush styling via the provided `classesContext`
 * and `stylesContext` context values. This function is designed to be run from
 * the internal `stylingApply` function (which is scheduled to run at the very
 * end of change detection for an element if one or more style/class bindings
 * were processed) and will rely on any state values that are set from when
 * any of the styling bindings executed.
 *
 * This function is designed to be called twice: one when change detection has
 * processed an element within the template bindings (i.e. just as `advance()`
 * is called) and when host bindings have been processed. In both cases the
 * styles and classes in both contexts will be applied to the element, but the
 * algorithm will selectively decide which bindings to run depending on the
 * columns in the context. The provided `directiveIndex` value will help the
 * algorithm determine which bindings to apply: either the template bindings or
 * the host bindings (see `applyStylingToElement` for more information).
 *
 * Note that once this function is called all temporary styling state data
 * (i.e. the `bitMask` and `counter` values for styles and classes will be cleared).
 */
export function flushStyling(
    renderer: Renderer3 | ProceduralRenderer3 | null, data: LStylingData,
    classesContext: TStylingContext | null, stylesContext: TStylingContext | null,
    element: RElement, directiveIndex: number, styleSanitizer: StyleSanitizeFn | null): void {
  ngDevMode && ngDevMode.flushStyling++;

  const state = getStylingState(element, directiveIndex);
  const hostBindingsMode = isHostStylingActive(state.sourceIndex);

  if (stylesContext) {
    if (!isContextLocked(stylesContext, hostBindingsMode)) {
      lockAndFinalizeContext(stylesContext, hostBindingsMode);
    }
    if (state.stylesBitMask !== 0) {
      applyStylingViaContext(
          stylesContext, renderer, element, data, state.stylesBitMask, setStyle, styleSanitizer,
          hostBindingsMode);
    }
  }

  if (classesContext) {
    if (!isContextLocked(classesContext, hostBindingsMode)) {
      lockAndFinalizeContext(classesContext, hostBindingsMode);
    }
    if (state.classesBitMask !== 0) {
      applyStylingViaContext(
          classesContext, renderer, element, data, state.classesBitMask, setClass, null,
          hostBindingsMode);
    }
  }

  resetStylingState();
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
 *
 * Note that the `TStylingContext` styling context contains two locks: one for template bindings
 * and another for host bindings. Either one of these locks will be set when styling is applied
 * during the template binding flush and/or during the host bindings flush.
 */
function lockAndFinalizeContext(context: TStylingContext, hostBindingsMode: boolean): void {
  const initialValues = getStylingMapArray(context) !;
  updateInitialStylingOnContext(context, initialValues);
  lockContext(context, hostBindingsMode);
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
  // `-1` is used here because all initial styling data is not a apart
  // of a binding (since it's static)
  const COUNT_ID_FOR_STYLING = -1;

  let hasInitialStyling = false;
  for (let i = StylingMapArrayIndex.ValuesStartPosition; i < initialStyling.length;
       i += StylingMapArrayIndex.TupleSize) {
    const value = getMapValue(initialStyling, i);
    if (value) {
      const prop = getMapProp(initialStyling, i);
      registerBinding(context, COUNT_ID_FOR_STYLING, 0, prop, value, false);
      hasInitialStyling = true;
    }
  }

  if (hasInitialStyling) {
    patchConfig(context, TStylingConfig.HasInitialStyling);
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
 * Visit `styling/map_based_bindings.ts` to learn more about how the
 * algorithm works for map-based styling bindings.
 *
 * Note that this function is not designed to be called in isolation (use
 * the `flushStyling` function so that it can call this function for both
 * the styles and classes contexts).
 */
export function applyStylingViaContext(
    context: TStylingContext, renderer: Renderer3 | ProceduralRenderer3 | null, element: RElement,
    bindingData: LStylingData, bitMaskValue: number | boolean, applyStylingFn: ApplyStylingFn,
    sanitizer: StyleSanitizeFn | null, hostBindingsMode: boolean): void {
  const bitMask = normalizeBitMaskValue(bitMaskValue);

  let stylingMapsSyncFn: SyncStylingMapsFn|null = null;
  let applyAllValues = false;
  if (hasConfig(context, TStylingConfig.HasMapBindings)) {
    stylingMapsSyncFn = getStylingMapsSyncFn();
    const mapsGuardMask =
        getGuardMask(context, TStylingContextIndex.ValuesStartPosition, hostBindingsMode);
    applyAllValues = (bitMask & mapsGuardMask) !== 0;
  }

  const valuesCount = getValuesCount(context);
  let totalBindingsToVisit = 1;
  let mapsMode =
      applyAllValues ? StylingMapsSyncMode.ApplyAllValues : StylingMapsSyncMode.TraverseValues;
  if (hostBindingsMode) {
    mapsMode |= StylingMapsSyncMode.RecurseInnerMaps;
    totalBindingsToVisit = valuesCount - 1;
  }

  let i = getPropValuesStartPosition(context);
  while (i < context.length) {
    const guardMask = getGuardMask(context, i, hostBindingsMode);
    if (bitMask & guardMask) {
      let valueApplied = false;
      const prop = getProp(context, i);
      const defaultValue = getDefaultValue(context, i);

      // Part 1: Visit the `[styling.prop]` value
      for (let j = 0; j < totalBindingsToVisit; j++) {
        const bindingIndex = getBindingValue(context, i, j) as number;
        if (!valueApplied && bindingIndex !== 0) {
          const value = getValue(bindingData, bindingIndex);
          if (isStylingValueDefined(value)) {
            const checkValueOnly = hostBindingsMode && j === 0;
            if (!checkValueOnly) {
              const finalValue = sanitizer && isSanitizationRequired(context, i) ?
                  sanitizer(prop, value, StyleSanitizeMode.SanitizeOnly) :
                  unwrapSafeValue(value);
              applyStylingFn(renderer, element, prop, finalValue, bindingIndex);
            }
            valueApplied = true;
          }
        }

        // Part 2: Visit the `[style]` or `[class]` map-based value
        if (stylingMapsSyncFn) {
          // determine whether or not to apply the target property or to skip it
          let mode = mapsMode | (valueApplied ? StylingMapsSyncMode.SkipTargetProp :
                                                StylingMapsSyncMode.ApplyTargetProp);

          // the first column in the context (when `j == 0`) is special-cased for
          // template bindings. If and when host bindings are being processed then
          // the first column will still be iterated over, but the values will only
          // be checked against (not applied). If and when this happens we need to
          // notify the map-based syncing code to know not to apply the values it
          // comes across in the very first map-based binding (which is also located
          // in column zero).
          if (hostBindingsMode && j === 0) {
            mode |= StylingMapsSyncMode.CheckValuesOnly;
          }

          const valueAppliedWithinMap = stylingMapsSyncFn(
              context, renderer, element, bindingData, j, applyStylingFn, sanitizer, mode, prop,
              defaultValue);
          valueApplied = valueApplied || valueAppliedWithinMap;
        }
      }

      // Part 3: apply the default value (e.g. `<div style="width:200">` => `200px` gets applied)
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
    if (hostBindingsMode) {
      mapsMode |= StylingMapsSyncMode.CheckValuesOnly;
    }
    stylingMapsSyncFn(
        context, renderer, element, bindingData, 0, applyStylingFn, sanitizer, mapsMode);
  }
}

/**
 * Applies the provided styling map to the element directly (without context resolution).
 *
 * This function is designed to be run from the styling instructions and will be called
 * automatically. This function is intended to be used for performance reasons in the
 * event that there is no need to apply styling via context resolution.
 *
 * See `allowDirectStylingApply`.
 *
 * @returns whether or not the styling map was applied to the element.
 */
export function applyStylingMapDirectly(
    renderer: any, context: TStylingContext, element: RElement, data: LStylingData,
    bindingIndex: number, map: StylingMapArray, applyFn: ApplyStylingFn,
    sanitizer?: StyleSanitizeFn | null, forceUpdate?: boolean): boolean {
  if (forceUpdate || hasValueChanged(data[bindingIndex], map)) {
    setValue(data, bindingIndex, map);
    for (let i = StylingMapArrayIndex.ValuesStartPosition; i < map.length;
         i += StylingMapArrayIndex.TupleSize) {
      const prop = getMapProp(map, i);
      const value = getMapValue(map, i);
      applyStylingValue(renderer, context, element, prop, value, applyFn, bindingIndex, sanitizer);
    }
    return true;
  }
  return false;
}

/**
 * Applies the provided styling prop/value to the element directly (without context resolution).
 *
 * This function is designed to be run from the styling instructions and will be called
 * automatically. This function is intended to be used for performance reasons in the
 * event that there is no need to apply styling via context resolution.
 *
 * See `allowDirectStylingApply`.
 *
 * @returns whether or not the prop/value styling was applied to the element.
 */
export function applyStylingValueDirectly(
    renderer: any, context: TStylingContext, element: RElement, data: LStylingData,
    bindingIndex: number, prop: string, value: any, applyFn: ApplyStylingFn,
    sanitizer?: StyleSanitizeFn | null): boolean {
  if (hasValueChanged(data[bindingIndex], value)) {
    setValue(data, bindingIndex, value);
    applyStylingValue(renderer, context, element, prop, value, applyFn, bindingIndex, sanitizer);
    return true;
  }
  return false;
}

function applyStylingValue(
    renderer: any, context: TStylingContext, element: RElement, prop: string, value: any,
    applyFn: ApplyStylingFn, bindingIndex: number, sanitizer?: StyleSanitizeFn | null) {
  let valueToApply: string|null = unwrapSafeValue(value);
  if (isStylingValueDefined(valueToApply)) {
    valueToApply =
        sanitizer ? sanitizer(prop, value, StyleSanitizeMode.SanitizeOnly) : valueToApply;
  } else if (hasConfig(context, TStylingConfig.HasInitialStyling)) {
    const initialStyles = getStylingMapArray(context);
    if (initialStyles) {
      valueToApply = findInitialStylingValue(initialStyles, prop);
    }
  }
  applyFn(renderer, element, prop, valueToApply, bindingIndex);
}

function findInitialStylingValue(map: StylingMapArray, prop: string): string|null {
  for (let i = StylingMapArrayIndex.ValuesStartPosition; i < map.length;
       i += StylingMapArrayIndex.TupleSize) {
    const p = getMapProp(map, i);
    if (p >= prop) {
      return p === prop ? getMapValue(map, i) : null;
    }
  }
  return null;
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
export const setStyle: ApplyStylingFn =
    (renderer: Renderer3 | null, native: RElement, prop: string, value: string | null) => {
      if (renderer !== null) {
        if (value) {
          // opacity, z-index and flexbox all have number values
          // and these need to be converted into strings so that
          // they can be assigned properly.
          value = value.toString();
          ngDevMode && ngDevMode.rendererSetStyle++;
          if (isProceduralRenderer(renderer)) {
            renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase);
          } else {
            // The reason why native style may be `null` is either because
            // it's a container element or it's a part of a test
            // environment that doesn't have styling. In either
            // case it's safe not to apply styling to the element.
            const nativeStyle = native.style;
            if (nativeStyle != null) {
              nativeStyle.setProperty(prop, value);
            }
          }
        } else {
          ngDevMode && ngDevMode.rendererRemoveStyle++;

          if (isProceduralRenderer(renderer)) {
            renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase);
          } else {
            const nativeStyle = native.style;
            if (nativeStyle != null) {
              nativeStyle.removeProperty(prop);
            }
          }
        }
      }
    };

/**
 * Adds/removes the provided className value to the provided element.
 */
export const setClass: ApplyStylingFn =
    (renderer: Renderer3 | null, native: RElement, className: string, value: any) => {
      if (renderer !== null && className !== '') {
        if (value) {
          ngDevMode && ngDevMode.rendererAddClass++;
          if (isProceduralRenderer(renderer)) {
            renderer.addClass(native, className);
          } else {
            // the reason why classList may be `null` is either because
            // it's a container element or it's a part of a test
            // environment that doesn't have styling. In either
            // case it's safe not to apply styling to the element.
            const classList = native.classList;
            if (classList != null) {
              classList.add(className);
            }
          }
        } else {
          ngDevMode && ngDevMode.rendererRemoveClass++;
          if (isProceduralRenderer(renderer)) {
            renderer.removeClass(native, className);
          } else {
            const classList = native.classList;
            if (classList != null) {
              classList.remove(className);
            }
          }
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
