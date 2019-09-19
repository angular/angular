/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {TNode, TNodeFlags} from '../interfaces/node';
import {LStylingData, StylingMapArray, StylingMapArrayIndex, TStylingConfig, TStylingContext, TStylingContextIndex, TStylingContextPropConfigFlags} from '../interfaces/styling';
import {NO_CHANGE} from '../tokens';

export const MAP_BASED_ENTRY_PROP_NAME = '[MAP]';
export const TEMPLATE_DIRECTIVE_INDEX = 0;

/**
 * Default fallback value for a styling binding.
 *
 * A value of `null` is used here which signals to the styling algorithm that
 * the styling value is not present. This way if there are no other values
 * detected then it will be removed once the style/class property is dirty and
 * diffed within the styling algorithm present in `flushStyling`.
 */
export const DEFAULT_BINDING_VALUE = null;

export const DEFAULT_BINDING_INDEX = 0;

const DEFAULT_TOTAL_SOURCES = 1;

// The first bit value reflects a map-based binding value's bit.
// The reason why it's always activated for every entry in the map
// is so that if any map-binding values update then all other prop
// based bindings will pass the guard check automatically without
// any extra code or flags.
export const DEFAULT_GUARD_MASK_VALUE = 0b1;

/**
 * Creates a new instance of the `TStylingContext`.
 *
 * The `TStylingContext` is used as a manifest of all style or all class bindings on
 * an element. Because it is a T-level data-structure, it is only created once per
 * tNode for styles and for classes. This function allocates a new instance of a
 * `TStylingContext` with the initial values (see `interfaces.ts` for more info).
 */
export function allocTStylingContext(initialStyling?: StylingMapArray | null): TStylingContext {
  initialStyling = initialStyling || allocStylingMapArray();
  return [
    TStylingConfig.Initial,  // 1) config for the styling context
    DEFAULT_TOTAL_SOURCES,   // 2) total amount of styling sources (template, directives, etc...)
    initialStyling,          // 3) initial styling values
  ];
}

export function allocStylingMapArray(): StylingMapArray {
  return [''];
}

export function getConfig(context: TStylingContext) {
  return context[TStylingContextIndex.ConfigPosition];
}

export function hasConfig(context: TStylingContext, flag: TStylingConfig) {
  return (getConfig(context) & flag) !== 0;
}

/**
 * Determines whether or not to apply styles/classes directly or via context resolution.
 *
 * There are three cases that are matched here:
 * 1. context is locked for template or host bindings (depending on `hostBindingsMode`)
 * 2. There are no collisions (i.e. properties with more than one binding)
 * 3. There are only "prop" or "map" bindings present, but not both
 */
export function allowDirectStyling(context: TStylingContext, hostBindingsMode: boolean): boolean {
  const config = getConfig(context);
  return ((config & getLockedConfig(hostBindingsMode)) !== 0) &&
      ((config & TStylingConfig.HasCollisions) === 0) &&
      ((config & TStylingConfig.HasPropAndMapBindings) !== TStylingConfig.HasPropAndMapBindings);
}

export function setConfig(context: TStylingContext, value: TStylingConfig): void {
  context[TStylingContextIndex.ConfigPosition] = value;
}

export function patchConfig(context: TStylingContext, flag: TStylingConfig): void {
  context[TStylingContextIndex.ConfigPosition] |= flag;
}

export function getProp(context: TStylingContext, index: number): string {
  return context[index + TStylingContextIndex.PropOffset] as string;
}

function getPropConfig(context: TStylingContext, index: number): number {
  return (context[index + TStylingContextIndex.ConfigOffset] as number) &
      TStylingContextPropConfigFlags.Mask;
}

export function isSanitizationRequired(context: TStylingContext, index: number): boolean {
  return (getPropConfig(context, index) & TStylingContextPropConfigFlags.SanitizationRequired) !==
      0;
}

export function getGuardMask(
    context: TStylingContext, index: number, isHostBinding: boolean): number {
  const position = index + (isHostBinding ? TStylingContextIndex.HostBindingsBitGuardOffset :
                                            TStylingContextIndex.TemplateBitGuardOffset);
  return context[position] as number;
}

export function setGuardMask(
    context: TStylingContext, index: number, maskValue: number, isHostBinding: boolean) {
  const position = index + (isHostBinding ? TStylingContextIndex.HostBindingsBitGuardOffset :
                                            TStylingContextIndex.TemplateBitGuardOffset);
  context[position] = maskValue;
}

export function getValuesCount(context: TStylingContext): number {
  return getTotalSources(context) + 1;
}

export function getTotalSources(context: TStylingContext): number {
  return context[TStylingContextIndex.TotalSourcesPosition];
}

export function getBindingValue(context: TStylingContext, index: number, offset: number) {
  return context[index + TStylingContextIndex.BindingsStartOffset + offset] as number | string;
}

export function getDefaultValue(context: TStylingContext, index: number): string|boolean|null {
  return context[index + TStylingContextIndex.BindingsStartOffset + getTotalSources(context)] as
             string |
      boolean | null;
}

export function setDefaultValue(
    context: TStylingContext, index: number, value: string | boolean | null) {
  return context[index + TStylingContextIndex.BindingsStartOffset + getTotalSources(context)] =
             value;
}

export function setValue(data: LStylingData, bindingIndex: number, value: any) {
  data[bindingIndex] = value;
}

export function getValue<T = any>(data: LStylingData, bindingIndex: number): T|null {
  return bindingIndex > 0 ? data[bindingIndex] as T : null;
}

export function lockContext(context: TStylingContext, hostBindingsMode: boolean): void {
  patchConfig(context, getLockedConfig(hostBindingsMode));
}

export function isContextLocked(context: TStylingContext, hostBindingsMode: boolean): boolean {
  return hasConfig(context, getLockedConfig(hostBindingsMode));
}

export function getLockedConfig(hostBindingsMode: boolean) {
  return hostBindingsMode ? TStylingConfig.HostBindingsLocked :
                            TStylingConfig.TemplateBindingsLocked;
}

export function getPropValuesStartPosition(context: TStylingContext) {
  let startPosition = TStylingContextIndex.ValuesStartPosition;
  if (hasConfig(context, TStylingConfig.HasMapBindings)) {
    startPosition += TStylingContextIndex.BindingsStartOffset + getValuesCount(context);
  }
  return startPosition;
}

export function hasValueChanged(
    a: NO_CHANGE | StylingMapArray | number | String | string | null | boolean | undefined | {},
    b: NO_CHANGE | StylingMapArray | number | String | string | null | boolean | undefined |
        {}): boolean {
  if (b === NO_CHANGE) return false;

  const compareValueA = Array.isArray(a) ? a[StylingMapArrayIndex.RawValuePosition] : a;
  const compareValueB = Array.isArray(b) ? b[StylingMapArrayIndex.RawValuePosition] : b;
  return !Object.is(compareValueA, compareValueB);
}

/**
 * Determines whether the provided styling value is truthy or falsy.
 */
export function isStylingValueDefined(value: any) {
  // the reason why null is compared against is because
  // a CSS class value that is set to `false` must be
  // respected (otherwise it would be treated as falsy).
  // Empty string values are because developers usually
  // set a value to an empty string to remove it.
  return value != null && value !== '';
}

export function concatString(a: string, b: string, separator = ' '): string {
  return a + ((b.length && a.length) ? separator : '') + b;
}

export function hyphenate(value: string): string {
  return value.replace(/[a-z][A-Z]/g, v => v.charAt(0) + '-' + v.charAt(1)).toLowerCase();
}

/**
 * Returns an instance of `StylingMapArray`.
 *
 * This function is designed to find an instance of `StylingMapArray` in case it is stored
 * inside of an instance of `TStylingContext`. When a styling context is created it
 * will copy over an initial styling values from the tNode (which are stored as a
 * `StylingMapArray` on the `tNode.classes` or `tNode.styles` values).
 */
export function getStylingMapArray(value: TStylingContext | StylingMapArray | null):
    StylingMapArray|null {
  return isStylingContext(value) ?
      (value as TStylingContext)[TStylingContextIndex.InitialStylingValuePosition] :
      value as StylingMapArray;
}

export function isStylingContext(value: TStylingContext | StylingMapArray | null): boolean {
  // the StylingMapArray is in the format of [initial, prop, string, prop, string]
  // and this is the defining value to distinguish between arrays
  return Array.isArray(value) && value.length >= TStylingContextIndex.ValuesStartPosition &&
      typeof value[1] !== 'string';
}

export function isStylingMapArray(value: TStylingContext | StylingMapArray | null): boolean {
  // the StylingMapArray is in the format of [initial, prop, string, prop, string]
  // and this is the defining value to distinguish between arrays
  return Array.isArray(value) &&
      (typeof(value as StylingMapArray)[StylingMapArrayIndex.ValuesStartPosition] === 'string');
}

export function getInitialStylingValue(context: TStylingContext | StylingMapArray | null): string {
  const map = getStylingMapArray(context);
  return map && (map[StylingMapArrayIndex.RawValuePosition] as string | null) || '';
}

export function hasClassInput(tNode: TNode) {
  return (tNode.flags & TNodeFlags.hasClassInput) !== 0;
}

export function hasStyleInput(tNode: TNode) {
  return (tNode.flags & TNodeFlags.hasStyleInput) !== 0;
}

export function getMapProp(map: StylingMapArray, index: number): string {
  return map[index + StylingMapArrayIndex.PropOffset] as string;
}

const MAP_DIRTY_VALUE =
    typeof ngDevMode !== 'undefined' && ngDevMode ? {} : {MAP_DIRTY_VALUE: true};

export function setMapAsDirty(map: StylingMapArray): void {
  map[StylingMapArrayIndex.RawValuePosition] = MAP_DIRTY_VALUE;
}

export function setMapValue(
    map: StylingMapArray, index: number, value: string | boolean | null): void {
  map[index + StylingMapArrayIndex.ValueOffset] = value;
}

export function getMapValue(map: StylingMapArray, index: number): string|null {
  return map[index + StylingMapArrayIndex.ValueOffset] as string | null;
}

export function forceClassesAsString(classes: string | {[key: string]: any} | null | undefined):
    string {
  if (classes && typeof classes !== 'string') {
    classes = Object.keys(classes).join(' ');
  }
  return (classes as string) || '';
}

export function forceStylesAsString(styles: {[key: string]: any} | null | undefined): string {
  let str = '';
  if (styles) {
    const props = Object.keys(styles);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      str = concatString(str, `${prop}:${styles[prop]}`, ';');
    }
  }
  return str;
}

export function isHostStylingActive(directiveOrSourceId: number): boolean {
  return directiveOrSourceId !== TEMPLATE_DIRECTIVE_INDEX;
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
 * away whenever the `{key:value}` map entries change).
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
