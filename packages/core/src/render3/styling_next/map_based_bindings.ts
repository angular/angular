/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn, StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {ProceduralRenderer3, RElement, Renderer3} from '../interfaces/renderer';

import {setStylingMapsSyncFn} from './bindings';
import {ApplyStylingFn, LStylingData, StylingMapArray, StylingMapArrayIndex, StylingMapsSyncMode, SyncStylingMapsFn, TStylingContext, TStylingContextIndex} from './interfaces';
import {concatString, getBindingValue, getMapProp, getMapValue, getValuesCount, hyphenate, isStylingValueDefined, setMapValue} from './util';



/**
 * --------
 *
 * This file contains the algorithm logic for applying map-based bindings
 * such as `[style]` and `[class]`.
 *
 * --------
 */

/**
 * Used to apply styling values presently within any map-based bindings on an element.
 *
 * Angular supports map-based styling bindings which can be applied via the
 * `[style]` and `[class]` bindings which can be placed on any HTML element.
 * These bindings can work independently, together or alongside prop-based
 * styling bindings (e.g. `<div [style]="x" [style.width]="w">`).
 *
 * If a map-based styling binding is detected by the compiler, the following
 * AOT code is produced:
 *
 * ```typescript
 * styleMap(ctx.styles); // styles = {key:value}
 * classMap(ctx.classes); // classes = {key:value}|string
 * ```
 *
 * If and when either of the instructions above are evaluated, then the code
 * present in this file is included into the bundle. The mechanism used, to
 * activate support for map-based bindings at runtime is possible via the
 * `activeStylingMapFeature` function (which is also present in this file).
 *
 * # The Algorithm
 * Whenever a map-based binding updates (which is when the identity of the
 * map-value changes) then the map is iterated over and a `StylingMapArray` array
 * is produced. The `StylingMapArray` instance is stored in the binding location
 * where the `BINDING_INDEX` is situated when the `styleMap()` or `classMap()`
 * instruction were called. Once the binding changes, then the internal `bitMask`
 * value is marked as dirty.
 *
 * Styling values are applied once CD exits the element (which happens when
 * the `select(n)` instruction is called or the template function exits). When
 * this occurs, all prop-based bindings are applied. If a map-based binding is
 * present then a special flushing function (called a sync function) is made
 * available and it will be called each time a styling property is flushed.
 *
 * The flushing algorithm is designed to apply styling for a property (which is
 * a CSS property or a className value) one by one. If map-based bindings
 * are present, then the flushing algorithm will keep calling the maps styling
 * sync function each time a property is visited. This way, the flushing
 * behavior of map-based bindings will always be at the same property level
 * as the current prop-based property being iterated over (because everything
 * is alphabetically sorted).
 *
 * Let's imagine we have the following HTML template code:
 *
 * ```html
 * <div [style]="{width:'100px', height:'200px', 'z-index':'10'}"
 *      [style.width.px]="200">...</div>
 * ```
 *
 * When CD occurs, both the `[style]` and `[style.width]` bindings
 * are evaluated. Then when the styles are flushed on screen, the
 * following operations happen:
 *
 * 1. `[style.width]` is attempted to be written to the element.
 *
 * 2.  Once that happens, the algorithm instructs the map-based
 *     entries (`[style]` in this case) to "catch up" and apply
 *     all values up to the `width` value. When this happens the
 *     `height` value is applied to the element (since it is
 *     alphabetically situated before the `width` property).
 *
 * 3. Since there are no more prop-based entries anymore, the
 *    loop exits and then, just before the flushing ends, it
 *    instructs all map-based bindings to "finish up" applying
 *    their values.
 *
 * 4. The only remaining value within the map-based entries is
 *    the `z-index` value (`width` got skipped because it was
 *    successfully applied via the prop-based `[style.width]`
 *    binding). Since all map-based entries are told to "finish up",
 *    the `z-index` value is iterated over and it is then applied
 *    to the element.
 *
 * The most important thing to take note of here is that prop-based
 * bindings are evaluated in order alongside map-based bindings.
 * This allows all styling across an element to be applied in O(n)
 * time (a similar algorithm is that of the array merge algorithm
 * in merge sort).
 */
export const syncStylingMap: SyncStylingMapsFn =
    (context: TStylingContext, renderer: Renderer3 | ProceduralRenderer3 | null, element: RElement,
     data: LStylingData, applyStylingFn: ApplyStylingFn, sanitizer: StyleSanitizeFn | null,
     mode: StylingMapsSyncMode, targetProp?: string | null,
     defaultValue?: string | null): boolean => {
      let targetPropValueWasApplied = false;

      // once the map-based styling code is activate it is never deactivated. For this reason a
      // check to see if the current styling context has any map based bindings is required.
      const totalMaps = getValuesCount(context, TStylingContextIndex.MapBindingsPosition);
      if (totalMaps) {
        let runTheSyncAlgorithm = true;
        const loopUntilEnd = !targetProp;

        // If the code is told to finish up (run until the end), but the mode
        // hasn't been flagged to apply values (it only traverses values) then
        // there is no point in iterating over the array because nothing will
        // be applied to the element.
        if (loopUntilEnd && (mode & ~StylingMapsSyncMode.ApplyAllValues)) {
          runTheSyncAlgorithm = false;
          targetPropValueWasApplied = true;
        }

        if (runTheSyncAlgorithm) {
          targetPropValueWasApplied = innerSyncStylingMap(
              context, renderer, element, data, applyStylingFn, sanitizer, mode, targetProp || null,
              0, defaultValue || null);
        }

        if (loopUntilEnd) {
          resetSyncCursors();
        }
      }

      return targetPropValueWasApplied;
    };

/**
 * Recursive function designed to apply map-based styling to an element one map at a time.
 *
 * This function is designed to be called from the `syncStylingMap` function and will
 * apply map-based styling data one map at a time to the provided `element`.
 *
 * This function is recursive and it will call itself if a follow-up map value is to be
 * processed. To learn more about how the algorithm works, see `syncStylingMap`.
 */
function innerSyncStylingMap(
    context: TStylingContext, renderer: Renderer3 | ProceduralRenderer3 | null, element: RElement,
    data: LStylingData, applyStylingFn: ApplyStylingFn, sanitizer: StyleSanitizeFn | null,
    mode: StylingMapsSyncMode, targetProp: string | null, currentMapIndex: number,
    defaultValue: string | null): boolean {
  let targetPropValueWasApplied = false;
  const totalMaps = getValuesCount(context, TStylingContextIndex.MapBindingsPosition);
  if (currentMapIndex < totalMaps) {
    const bindingIndex = getBindingValue(
        context, TStylingContextIndex.MapBindingsPosition, currentMapIndex) as number;
    const stylingMapArr = data[bindingIndex] as StylingMapArray;

    let cursor = getCurrentSyncCursor(currentMapIndex);
    while (cursor < stylingMapArr.length) {
      const prop = getMapProp(stylingMapArr, cursor);
      const iteratedTooFar = targetProp && prop > targetProp;
      const isTargetPropMatched = !iteratedTooFar && prop === targetProp;
      const value = getMapValue(stylingMapArr, cursor);
      const valueIsDefined = isStylingValueDefined(value);

      // the recursive code is designed to keep applying until
      // it reaches or goes past the target prop. If and when
      // this happens then it will stop processing values, but
      // all other map values must also catch up to the same
      // point. This is why a recursive call is still issued
      // even if the code has iterated too far.
      const innerMode =
          iteratedTooFar ? mode : resolveInnerMapMode(mode, valueIsDefined, isTargetPropMatched);
      const innerProp = iteratedTooFar ? targetProp : prop;
      let valueApplied = innerSyncStylingMap(
          context, renderer, element, data, applyStylingFn, sanitizer, innerMode, innerProp,
          currentMapIndex + 1, defaultValue);

      if (iteratedTooFar) {
        if (!targetPropValueWasApplied) {
          targetPropValueWasApplied = valueApplied;
        }
        break;
      }

      if (!valueApplied && isValueAllowedToBeApplied(mode, isTargetPropMatched)) {
        const useDefault = isTargetPropMatched && !valueIsDefined;
        const valueToApply = useDefault ? defaultValue : value;
        const bindingIndexToApply = useDefault ? bindingIndex : null;
        const finalValue = sanitizer ?
            sanitizer(prop, valueToApply, StyleSanitizeMode.ValidateAndSanitize) :
            valueToApply;
        applyStylingFn(renderer, element, prop, finalValue, bindingIndexToApply);
        valueApplied = true;
      }

      targetPropValueWasApplied = valueApplied && isTargetPropMatched;
      cursor += StylingMapArrayIndex.TupleSize;
    }
    setCurrentSyncCursor(currentMapIndex, cursor);

    // this is a fallback case in the event that the styling map is `null` for this
    // binding but there are other map-based bindings that need to be evaluated
    // afterwards. If the `prop` value is falsy then the intention is to cycle
    // through all of the properties in the remaining maps as well. If the current
    // styling map is too short then there are no values to iterate over. In either
    // case the follow-up maps need to be iterated over.
    if (stylingMapArr.length === StylingMapArrayIndex.ValuesStartPosition || !targetProp) {
      return innerSyncStylingMap(
          context, renderer, element, data, applyStylingFn, sanitizer, mode, targetProp,
          currentMapIndex + 1, defaultValue);
    }
  }


  return targetPropValueWasApplied;
}


/**
 * Enables support for map-based styling bindings (e.g. `[style]` and `[class]` bindings).
 */
export function activateStylingMapFeature() {
  setStylingMapsSyncFn(syncStylingMap);
}

/**
 * Used to determine the mode for the inner recursive call.
 *
 * If an inner map is iterated on then this is done so for one
 * of two reasons:
 *
 * - value is being applied:
 *   if the value is being applied from this current styling
 *   map then there is no need to apply it in a deeper map.
 *
 * - value is being not applied:
 *   apply the value if it is found in a deeper map.
 *
 * When these reasons are encountered the flags will for the
 * inner map mode will be configured.
 */
function resolveInnerMapMode(
    currentMode: number, valueIsDefined: boolean, isExactMatch: boolean): number {
  let innerMode = currentMode;
  if (!valueIsDefined && !(currentMode & StylingMapsSyncMode.SkipTargetProp) &&
      (isExactMatch || (currentMode & StylingMapsSyncMode.ApplyAllValues))) {
    // case 1: set the mode to apply the targeted prop value if it
    // ends up being encountered in another map value
    innerMode |= StylingMapsSyncMode.ApplyTargetProp;
    innerMode &= ~StylingMapsSyncMode.SkipTargetProp;
  } else {
    // case 2: set the mode to skip the targeted prop value if it
    // ends up being encountered in another map value
    innerMode |= StylingMapsSyncMode.SkipTargetProp;
    innerMode &= ~StylingMapsSyncMode.ApplyTargetProp;
  }

  return innerMode;
}

/**
 * Decides whether or not a prop/value entry will be applied to an element.
 *
 * To determine whether or not a value is to be applied,
 * the following procedure is evaluated:
 *
 * First check to see the current `mode` status:
 *  1. If the mode value permits all props to be applied then allow.
 *    - But do not allow if the current prop is set to be skipped.
 *  2. Otherwise if the current prop is permitted then allow.
 */
function isValueAllowedToBeApplied(mode: number, isTargetPropMatched: boolean) {
  let doApplyValue = (mode & StylingMapsSyncMode.ApplyAllValues) > 0;
  if (!doApplyValue) {
    if (mode & StylingMapsSyncMode.ApplyTargetProp) {
      doApplyValue = isTargetPropMatched;
    }
  } else if ((mode & StylingMapsSyncMode.SkipTargetProp) && isTargetPropMatched) {
    doApplyValue = false;
  }
  return doApplyValue;
}

/**
 * Used to keep track of concurrent cursor values for multiple map-based styling bindings present on
 * an element.
 */
const MAP_CURSORS: number[] = [];

/**
 * Used to reset the state of each cursor value being used to iterate over map-based styling
 * bindings.
 */
function resetSyncCursors() {
  for (let i = 0; i < MAP_CURSORS.length; i++) {
    MAP_CURSORS[i] = StylingMapArrayIndex.ValuesStartPosition;
  }
}

/**
 * Returns an active cursor value at a given mapIndex location.
 */
function getCurrentSyncCursor(mapIndex: number) {
  if (mapIndex >= MAP_CURSORS.length) {
    MAP_CURSORS.push(StylingMapArrayIndex.ValuesStartPosition);
  }
  return MAP_CURSORS[mapIndex];
}

/**
 * Sets a cursor value at a given mapIndex location.
 */
function setCurrentSyncCursor(mapIndex: number, indexValue: number) {
  MAP_CURSORS[mapIndex] = indexValue;
}

/**
 * Used to convert a {key:value} map into a `StylingMapArray` array.
 *
 * This function will either generate a new `StylingMapArray` instance
 * or it will patch the provided `newValues` map value into an
 * existing `StylingMapArray` value (this only happens if `bindingValue`
 * is an instance of `StylingMapArray`).
 *
 * If a new key/value map is provided with an old `StylingMapArray`
 * value then all properties will be overwritten with their new
 * values or with `null`. This means that the array will never
 * shrink in size (but it will also not be created and thrown
 * away whenever the {key:value} map entries change).
 */
export function normalizeIntoStylingMap(
    bindingValue: null | StylingMapArray,
    newValues: {[key: string]: any} | string | null | undefined,
    normalizeProps?: boolean): StylingMapArray {
  const stylingMapArr: StylingMapArray = Array.isArray(bindingValue) ? bindingValue : [null];
  stylingMapArr[StylingMapArrayIndex.RawValuePosition] = newValues || null;

  // because the new values may not include all the properties
  // that the old ones had, all values are set to `null` before
  // the new values are applied. This way, when flushed, the
  // styling algorithm knows exactly what style/class values
  // to remove from the element (since they are `null`).
  for (let j = StylingMapArrayIndex.ValuesStartPosition; j < stylingMapArr.length;
       j += StylingMapArrayIndex.TupleSize) {
    setMapValue(stylingMapArr, j, null);
  }

  let props: string[]|null = null;
  let map: {[key: string]: any}|undefined|null;
  let allValuesTrue = false;
  if (typeof newValues === 'string') {  // [class] bindings allow string values
    if (newValues.length) {
      props = newValues.split(/\s+/);
      allValuesTrue = true;
    }
  } else {
    props = newValues ? Object.keys(newValues) : null;
    map = newValues;
  }

  if (props) {
    for (let i = 0; i < props.length; i++) {
      const prop = props[i] as string;
      const newProp = normalizeProps ? hyphenate(prop) : prop;
      const value = allValuesTrue ? true : map ![prop];
      addItemToStylingMap(stylingMapArr, newProp, value, true);
    }
  }

  return stylingMapArr;
}

/**
 * Inserts the provided item into the provided styling array at the right spot.
 *
 * The `StylingMapArray` type is a sorted key/value array of entries. This means
 * that when a new entry is inserted it must be placed at the right spot in the
 * array. This function figures out exactly where to place it.
 */
export function addItemToStylingMap(
    stylingMapArr: StylingMapArray, prop: string, value: string | boolean | null,
    allowOverwrite?: boolean) {
  for (let j = StylingMapArrayIndex.ValuesStartPosition; j < stylingMapArr.length;
       j += StylingMapArrayIndex.TupleSize) {
    const propAtIndex = getMapProp(stylingMapArr, j);
    if (prop <= propAtIndex) {
      let applied = false;
      if (propAtIndex === prop) {
        const valueAtIndex = stylingMapArr[j];
        if (allowOverwrite || !isStylingValueDefined(valueAtIndex)) {
          applied = true;
          setMapValue(stylingMapArr, j, value);
        }
      } else {
        applied = true;
        stylingMapArr.splice(j, 0, prop, value);
      }
      return applied;
    }
  }

  stylingMapArr.push(prop, value);
  return true;
}

/**
 * Converts the provided styling map array into a string.
 *
 * Classes => `one two three`
 * Styles => `prop:value; prop2:value2`
 */
export function stylingMapToString(map: StylingMapArray, isClassBased: boolean): string {
  let str = '';
  for (let i = StylingMapArrayIndex.ValuesStartPosition; i < map.length;
       i += StylingMapArrayIndex.TupleSize) {
    const prop = getMapProp(map, i);
    const value = getMapValue(map, i) as string;
    const attrValue = concatString(prop, isClassBased ? '' : value, ':');
    str = concatString(str, attrValue, isClassBased ? ' ' : '; ');
  }
  return str;
}

/**
 * Converts the provided styling map array into a key value map.
 */
export function stylingMapToStringMap(map: StylingMapArray | null): {[key: string]: any} {
  let stringMap: {[key: string]: any} = {};
  if (map) {
    for (let i = StylingMapArrayIndex.ValuesStartPosition; i < map.length;
         i += StylingMapArrayIndex.TupleSize) {
      const prop = getMapProp(map, i);
      const value = getMapValue(map, i) as string;
      stringMap[prop] = value;
    }
  }
  return stringMap;
}
