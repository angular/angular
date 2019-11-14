/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {unwrapSafeValue} from '../../sanitization/bypass';
import {PropertyAliases, TNodeFlags} from '../interfaces/node';
import {RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {ApplyStylingFn, LStylingData, StylingMapArray, StylingMapArrayIndex, TDataStylingFlags, TStylingContext, TStylingContextIndex, TStylingContextPropConfigFlags, TStylingNode} from '../interfaces/styling';
import {LView, TData} from '../interfaces/view';
import {NO_CHANGE} from '../tokens';

export const MAP_BASED_ENTRY_PROP_NAME = '[MAP]';
export const TEMPLATE_DIRECTIVE_INDEX = 0;

// classOne-SEPARATOR-classTwo
export const CLASS_ENTRIES_SEPARATOR = ' ';

// propAndValue-SEPARATOR-propAndValue
export const STYLE_ENTRIES_SEPARATOR = '; ';

// style-SEPARATOR-prop
const STYLE_PROP_VALUE_SEPARATOR = ':';

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
export function allocTStylingContext(
    initialStyling: StylingMapArray | null, hasDirectives: boolean): TStylingContext {
  initialStyling = initialStyling || allocStylingMapArray(null);
  return [
    DEFAULT_TOTAL_SOURCES,  // 1) total amount of styling sources (template, directives, etc...)
    initialStyling,         // 2) initial styling values
  ];
}

export function allocStylingMapArray(value: {} | string | null): StylingMapArray {
  return [value];
}

export function hasConfig(tNode: TStylingNode, flag: TNodeFlags) {
  return (tNode.flags & flag) !== 0;
}

/**
 * Determines whether or not to apply styles/classes directly or via context resolution.
 *
 * There are three cases that are matched here:
 * 1. there are no directives present AND `ngDevMode` is falsy
 * 2. the `firstUpdatePass` has not already run (which means that
 *    there are more bindings to register and, therefore, direct
 *    style/class application is not yet possible)
 * 3. There are no collisions (i.e. properties with more than one binding) across multiple
 *    sources (i.e. template + directive, directive + directive, directive + component)
 */
export function allowDirectStyling(tNode: TStylingNode, isClassBased: boolean): boolean {
  const flagToCheck = TNodeFlags.hasHostBindings |
      (isClassBased ? TNodeFlags.hasClassContextInUse : TNodeFlags.hasStyleContextInUse);
  return (tNode.flags & flagToCheck) === 0;
}

export function patchConfig(tNode: TStylingNode, flag: TNodeFlags): void {
  tNode.flags |= flag;
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
  return bindingIndex !== 0 ? data[bindingIndex] as T : null;
}

export function getPropValuesStartPosition(
    context: TStylingContext, tNode: TStylingNode, isClassBased: boolean) {
  let startPosition = TStylingContextIndex.ValuesStartPosition;
  const flag = isClassBased ? TNodeFlags.hasClassMapBindings : TNodeFlags.hasStyleMapBindings;
  if (hasConfig(tNode, flag)) {
    startPosition += TStylingContextIndex.BindingsStartOffset + getValuesCount(context);
  }
  return startPosition;
}

export function hasValueChangedUnwrapSafeValue(
    a: NO_CHANGE | StylingMapArray | number | String | string | null | boolean | undefined | {},
    b: NO_CHANGE | StylingMapArray | number | String | string | null | boolean | undefined |
        {}): boolean {
  return hasValueChanged(unwrapSafeValue(a), unwrapSafeValue(b));
}


export function hasValueChanged(
    oldValue: NO_CHANGE | StylingMapArray | number | string | null | boolean | undefined | {},
    newValue: NO_CHANGE | StylingMapArray | number | string | null | boolean | undefined |
        {}): boolean {
  if (newValue === NO_CHANGE) return false;

  const oldValueToCompare =
      Array.isArray(oldValue) ? oldValue[StylingMapArrayIndex.RawValuePosition] : oldValue;
  const newValueToCompare =
      Array.isArray(newValue) ? newValue[StylingMapArrayIndex.RawValuePosition] : newValue;
  return !Object.is(oldValueToCompare, newValueToCompare);
}

/**
 * Determines whether the provided styling value is truthy or falsy.
 */
export function isStylingValueDefined<T extends string|number|{}|null|undefined>(value: T):
    value is NonNullable<T> {
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

export function isStylingContext(value: any): boolean {
  // the StylingMapArray is in the format of [initial, prop, string, prop, string]
  // and this is the defining value to distinguish between arrays
  return Array.isArray(value) && value.length >= TStylingContextIndex.ValuesStartPosition &&
      typeof value[1] !== 'string';
}

export function isStylingMapArray(value: any): value is StylingMapArray {
  // the StylingMapArray is in the format of [initial, prop, string, prop, string]
  // and this is the defining value to distinguish between arrays
  return Array.isArray(value) &&
      (typeof(value as StylingMapArray)[StylingMapArrayIndex.ValuesStartPosition] === 'string');
}

export function getInitialStylingValue(context: TStylingContext | StylingMapArray | null): string {
  const map = getStylingMapArray(context);
  return map && (map[StylingMapArrayIndex.RawValuePosition] as string | null) || '';
}

export function hasClassInput(tNode: TStylingNode) {
  return (tNode.flags & TNodeFlags.hasClassInput) !== 0;
}

export function hasStyleInput(tNode: TStylingNode) {
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
    classes = Object.keys(classes).join(CLASS_ENTRIES_SEPARATOR);
  }
  return (classes as string) || '';
}

export function forceStylesAsString(
    styles: {[key: string]: any} | string | null | undefined, hyphenateProps: boolean): string {
  if (typeof styles == 'string') return styles;
  let str = '';
  if (styles) {
    const props = Object.keys(styles);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const propLabel = hyphenateProps ? hyphenate(prop) : prop;
      const value = styles[prop];
      if (value !== null) {
        str = concatString(str, concatStyle(propLabel, value), STYLE_ENTRIES_SEPARATOR);
      }
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
    const attrValue = isClassBased ? prop : concatStyle(prop, value);
    str = concatString(
        str, attrValue, isClassBased ? CLASS_ENTRIES_SEPARATOR : STYLE_ENTRIES_SEPARATOR);
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
  const stylingMapArr: StylingMapArray =
      Array.isArray(bindingValue) ? bindingValue : allocStylingMapArray(null);
  stylingMapArr[StylingMapArrayIndex.RawValuePosition] = newValues;

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
    props = splitOnWhitespace(newValues);
    allValuesTrue = props !== null;
  } else {
    props = newValues ? Object.keys(newValues) : null;
    map = newValues;
  }

  if (props) {
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const newProp = normalizeProps ? hyphenate(prop) : prop;
      const value = allValuesTrue ? true : map ![prop];
      addItemToStylingMap(stylingMapArr, newProp, value, true);
    }
  }

  return stylingMapArr;
}

export function splitOnWhitespace(text: string): string[]|null {
  let array: string[]|null = null;
  let length = text.length;
  let start = 0;
  let foundChar = false;
  for (let i = 0; i < length; i++) {
    const char = text.charCodeAt(i);
    if (char <= 32 /*' '*/) {
      if (foundChar) {
        if (array === null) array = [];
        array.push(text.substring(start, i));
        foundChar = false;
      }
      start = i + 1;
    } else {
      foundChar = true;
    }
  }
  if (foundChar) {
    if (array === null) array = [];
    array.push(text.substring(start, length));
    foundChar = false;
  }
  return array;
}

// TODO (matsko|AndrewKushnir): refactor this once we figure out how to generate separate
// `input('class') + classMap()` instructions.
export function selectClassBasedInputName(inputs: PropertyAliases): string {
  return inputs.hasOwnProperty('class') ? 'class' : 'className';
}

/**
 * Returns a style entry with the `prop` and `value` concatenated together
 */
export function concatStyle(prop: string, value: string) {
  return `${prop}${STYLE_PROP_VALUE_SEPARATOR}${value}`;
}

/**
 * Assigns a style value to a style property for the given element.
 */
export const setStyle: ApplyStylingFn =
    (renderer: Renderer3 | null, native: RElement, prop: string, value: string | null) => {
      if (renderer !== null) {
        // Use `isStylingValueDefined` to account for falsy values that should be bound like 0.
        if (isStylingValueDefined(value)) {
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
 * Sets the provided className value to the provided element's `className` property.
 */
export const setClassName = (renderer: Renderer3 | null, native: RElement, className: string) => {
  if (renderer !== null) {
    if (isProceduralRenderer(renderer)) {
      renderer.setAttribute(native, 'class', className);
    } else {
      native.className = className;
    }
  }
};

/**
 * Sets the provided style value to the provided element's `style` attribute.
 */
export const setStyleAttr = (renderer: Renderer3 | null, native: RElement, value: string) => {
  if (renderer !== null) {
    if (isProceduralRenderer(renderer)) {
      renderer.setAttribute(native, 'style', value);
    } else {
      native.setAttribute('style', value);
    }
  }
};

export function isDirectSanitizationRequired(tData: TData, bindingIndex: number) {
  return ((tData[bindingIndex + 1] as number) & TDataStylingFlags.SanitizationRequiredFlag) !== 0;
}

export function isInitialValueOverlap(tData: TData, bindingIndex: number) {
  return ((tData[bindingIndex + 1] as number) & TDataStylingFlags.HasInitialValueOverlap) !== 0;
}

/**
 * Gets the previous style/class index that was registered just before the provided `bindingIndex`
 *
 * A previous binding index points to the previous style/class binding entry
 * (which is stored inside of `TData`). Previous binding indices are used to
 * connect each of the style/class bindings together so that the direct-write
 * algorithm can keep track of cached values.
 *
 * When a previous binding index is set, the first few bits will be reserved
 * to keep track of styling flags. These flags are stripped out (using bit
 * shifting) when this function is called.
 */
export function getPreviousBindingIndex(tData: TData, bindingIndex: number) {
  const value = tData[bindingIndex + 1] as number;
  return value >> TDataStylingFlags.TotalBits;
}

/**
 * Sets the provided style/class binding entry to point to the provided `previousBindingIndex`
 */
export function setPreviousBindingIndex(
    tData: TData, bindingIndex: number, previousBindingIndex: number, sanitizationRequired: boolean,
    hasPotentialOverlap: boolean) {
  let value = previousBindingIndex << TDataStylingFlags.TotalBits;
  if (sanitizationRequired) {
    value |= TDataStylingFlags.SanitizationRequiredFlag;
  }
  if (hasPotentialOverlap) {
    value |= TDataStylingFlags.HasInitialValueOverlap;
  }
  tData[bindingIndex + 1] = value;
}

/**
 * Gets the cached binding value for a binding location in the `LView`.
 *
 * Cached values are used in the direct-write styling algorithm to store
 * an intermediate concatenated string value of all the binding entries
 * that came before it.
 *
 * Given the following binding code:
 *
 * ```html
 * <div [style.width]="'100px'" [style.height]="'200px'">..</div>
 * ```
 *
 * Our `LView` will look like so:
 *
 * ```typescript
 * LView = [
 *   // ...
 *   '100px', // width
 *   'width:100px' // CACHED VALUE (in this case just `width`)
 *
 *   // ...
 *   '200px', // BINDING VALUE
 *   'width:100px; height:200px' // CACHED VALUE (in this case `width` and `height`)
 * ]
 * ```
 */
export function getCachedValue(lView: LView, bindingIndex: number): string {
  const value = lView[bindingIndex + 1];
  return typeof value === 'string' ? value : '';
}

/**
 * Updates the cached binding value for a binding location in the `LView`.
 *
 * See [getCachedValue].
 */
export function setCachedValue(lView: LView, bindingIndex: number, value: string) {
  lView[bindingIndex + 1] = value;
}
