/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {unwrapSafeValue} from '../../sanitization/bypass';
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {CharCode} from '../../util/char_code';
import {throwErrorIfNoChangesMode} from '../errors';
import {AttributeMarker, PropertyAliases, TAttributes, TNode, TNodeFlags} from '../interfaces/node';
import {RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {LStylingData, TDataStylingFlags, TDataStylingIndex, TStyleProperty} from '../interfaces/styling';
import {TData} from '../interfaces/view';
import {incrementBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';


/**
 * --------
 *
 * This file contains various utilities for styling in Angular.
 *
 * To learn more about the algorithm see `instructions/styling.ts`.
 *
 * --------
 */

/**
 * Used to help determine whether or not a template is being processed in change detection.
 *
 * If and when any binding code is processed it is helpful to know whether the
 * template or hostBindings are being processed. This constant helps determine
 * whether or not that is true for templates.
 */
export const TEMPLATE_DIRECTIVE_INDEX = 0;

// classOne-wSEPARATOR-classTwo
export const CLASS_ENTRIES_SEPARATOR = ' ';

// propAndValue-SEPARATOR-propAndValue
export const STYLE_ENTRIES_SEPARATOR = '; ';

// prop-SEPARATOR-value
const STYLE_PROP_VALUE_SEPARATOR = ': ';

/**
 * Whether or not a specific styling config flag is set to true on a `tNode`
 */
export function hasConfig(tNode: TNode, flag: TNodeFlags): boolean {
  return (tNode.flags & flag) !== 0;
}

/**
 * Sets (turns on) one or more styling flags to true on the provided `tNode`
 */
export function patchConfig(tNode: TNode, flag: TNodeFlags): void {
  tNode.flags |= flag;
}

/**
 * Updates the provided `value` in the `LStylingData` at the given `bindingIndex`
 */
export function setValue(data: LStylingData, bindingIndex: number, value: any): void {
  data[bindingIndex] = value;
}

/**
 * Returns the value set at the provided `bindingIndex` in the `LStylingData` array
 */
export function getValue<T = any>(data: LStylingData, bindingIndex: number): T|null {
  return data[bindingIndex] as T | null;
}

/**
 * Unwraps both values and determines whether or not there is a value change
 */
export function hasValueChangedUnwrapSafeValue(
    a: NO_CHANGE | number | String | string | null | boolean | undefined | {},
    b: NO_CHANGE | number | String | string | null | boolean | undefined | {}): boolean {
  return hasValueChanged(unwrapSafeValue(a), unwrapSafeValue(b));
}

/**
 * Determines whether or not there is a value change
 */
export function hasValueChanged(
    a: NO_CHANGE | number | string | null | boolean | undefined | {},
    b: NO_CHANGE | number | string | null | boolean | undefined | {}): boolean {
  if (b === NO_CHANGE) return false;
  return !Object.is(a, b);
}

/**
 * Determines whether the provided styling value is truthy or falsy
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

/**
 * Combines both strings together with the provided separator
 *
 * @returns the concatenated string value
 */
export function concatString(a: string, b: string | null, separator: string): string {
  if (b === null || b === '') return a;
  if (a === '') return b;
  return a + separator + b;
}

/**
 * Used to compare upper and lowercase values without using `toUpperCase()`/`toLowerCase()`
 */
const LOWERCASE_CHAR_BIT = 32;

/**
 * Converts all camelCase words into hyphenated strings.
 *
 * For example:
 *
 * ```typescript
 * hyphenate('foo') // foo
 * hyphenate('fooBar') // foo-bar
 * hyphenate('fooBarBaz') // foo-bar-baz
 * ```
 */
export function hyphenate(str: string): string {
  let lastSlicePoint = 0;
  let returnStr: string|null = null;
  for (let i = 0, j = 1; j < str.length; i++, j++) {
    const c1 = str.charCodeAt(i);
    const c2 = str.charCodeAt(j);
    const c1IsLower = (c1 & LOWERCASE_CHAR_BIT) !== 0;
    const c2IsUpper = (c2 & LOWERCASE_CHAR_BIT) === 0;
    if (c1IsLower && c2IsUpper) {
      returnStr = returnStr === null ? '' : returnStr;
      const lhs = str.substring(lastSlicePoint, j);
      const c2Lower = String.fromCharCode(c2 | LOWERCASE_CHAR_BIT);
      returnStr = `${returnStr}${lhs}-${c2Lower}`;
      lastSlicePoint = j + 1;
    }
  }
  return returnStr !== null ? (returnStr + str.substr(lastSlicePoint)) : str;
}

/**
 * Whether or not the provided `tNode` is marked with having any `@Input('class')` input setters
 */
export function hasClassInput(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.hasClassInput) !== 0;
}

/**
 * Whether or not the provided `tNode` is marked with having any `@Input('style')` input setters
 */
export function hasStyleInput(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.hasStyleInput) !== 0;
}

/**
 * Converts a `{key:value}` map of classes into a className string
 */
export function forceClassesAsString(classes: string | {[key: string]: any} | null | undefined):
    string {
  if (classes && typeof classes !== 'string') {
    classes = Object.keys(classes).join(CLASS_ENTRIES_SEPARATOR);
  }
  return (classes as string) || '';
}

/**
 * Converts a `{key:value}` map of styles into a style string
 *
 * For example:
 *
 * ```typescript
 * fn({})                               // ""
 * fn({key:'value'})                    // "key: value"
 * fn({key1:'value1', "key2: 'value2'}) // "key1: value1; key2: value2"
 * fn({key1:'value1', "key2: 'a b c'})  // "key1: value1; key2: a b c"
 * ```
 */
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

/**
 * Whether or not the current source being processed is a directive or component
 */
export function isHostStylingActive(directiveOrSourceId: number): boolean {
  return directiveOrSourceId !== TEMPLATE_DIRECTIVE_INDEX;
}

/**
 * Tokenizes the provided `text` value by spaces into an array
 */
export function splitOnWhitespace(text: string): string[]|null {
  let array: string[]|null = null;
  let length = text.length;
  let start = 0;
  let foundChar = false;
  for (let i = 0; i < length; i++) {
    const char = text.charCodeAt(i);
    if (char <= CharCode.SPACE) {
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
export function concatStyle(prop: string, value: string): string {
  return `${prop}${STYLE_PROP_VALUE_SEPARATOR}${value}`;
}

/**
 * Appends a style/class entry (className or prop:value) to the provided `str` value
 */
export function concatStylingEntry(
    lhs: string, prop: string, value: string | boolean, isClassBased: boolean): string {
  const separator = isClassBased ? CLASS_ENTRIES_SEPARATOR : STYLE_ENTRIES_SEPARATOR;
  const entry = isClassBased ? prop : concatStyle(prop, value as string);
  if (lhs === '') return entry;
  return lhs + separator + entry;
}

/**
 * Assigns a style value to a style property for the given element.
 *
 * If `value` is `null` then the provided `prop` will be deleted from the element's style values.
 */
export function setStyle(
    renderer: Renderer3, native: RElement, prop: string, value: string | null): void {
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

/**
 * Adds/removes the provided className value to the provided element.
 *
 * If `value` is `null` then the provided `className` will be deleted from the element's classList.
 */
export function setClass(
    renderer: Renderer3, native: RElement, className: string, value: any): void {
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

/**
 * Sets the provided className value to the provided element's `className` property.
 */
export function setClassName(renderer: Renderer3, native: RElement, className: string): void {
  ngDevMode && ngDevMode.rendererSetClassName++;
  if (isProceduralRenderer(renderer)) {
    // Writing to `className` seems to be faster than `setAttribute`
    // renderer.setProperty(native, 'className', className);
    renderer.setAttribute(native, 'class', className);
  } else {
    native.className = className;
  }
}

/**
 * Sets the provided style value to the provided element's `style` attribute.
 */
export function setStyleAttr(renderer: Renderer3, native: RElement, value: string): void {
  ngDevMode && ngDevMode.rendererSetStyle++;
  if (isProceduralRenderer(renderer)) {
    renderer.setAttribute(native, 'style', value);
  } else {
    native.setAttribute('style', value);
  }
}

/**
 * Returns the configuration value for a styling binding that was registered into `TData`.
 *
 * Each time a styling binding is registered, the entry will take up two slots
 * within the `TData` array. The second slot is used for pointers and
 * configuration data. This function returns that value.
 */
function getBindingConfigAndPointers(tData: TData, bindingIndex: number): number {
  return tData[bindingIndex + 1] as number;
}

/**
 * Whether or not the styling entry is a host binding.
 */
export function isHostBinding(tData: TData, bindingIndex: number): boolean {
  return (getBindingConfigAndPointers(tData, bindingIndex) & TDataStylingFlags.IsHostBinding) !== 0;
}

/**
 * Whether or not the styling entry is a directive host binding.
 */
export function isDirectiveHostBinding(tData: TData, bindingIndex: number): boolean {
  return (getBindingConfigAndPointers(tData, bindingIndex) &
          TDataStylingFlags.IsDirectiveHostBinding) !== 0;
}

/**
 * Whether or not the styling entry is a component host binding.
 */
export function isComponentHostBinding(tData: TData, bindingIndex: number): boolean {
  return (getBindingConfigAndPointers(tData, bindingIndex) &
          TDataStylingFlags.IsComponentHostBinding) !== 0;
}

/**
 * Whether or not the styling entry is a duplicate of another binding.
 *
 * Duplicate styling bindings are tracked so that the concatenation algorithm
 * can efficiently decide whether or not to parse existing style/class values
 * out of the concatenation string.
 */
export function isDuplicateBinding(tData: TData, bindingIndex: number): boolean {
  return (getBindingConfigAndPointers(tData, bindingIndex) &
          TDataStylingFlags.IsDuplicateBinding) !== 0;
}

/**
 * Gets the previous style/class index that was registered just before the provided `bindingIndex`.
 *
 * A previous binding index points to the previous style/class binding entry
 * (which is stored inside of `TData`). Previous binding indices are used to
 * connect each of the style/class bindings together so that the style/class
 * concatenation algorithm can keep track of concatenated values.
 *
 * When a previous binding index is set, the first few bits will be reserved
 * to keep track of styling flags. These flags are stripped out (using bit
 * shifting) when this function is called.
 */
export function getPreviousBindingIndex(tData: TData, bindingIndex: number): number {
  const value = getBindingConfigAndPointers(tData, bindingIndex);
  return (value & TDataStylingIndex.PreviousIndexMask) >>
      TDataStylingIndex.TotalBitsBeforePreviousIndex;
}

/**
 * Gets the next style/class index that was registered just before the provided `bindingIndex`.
 *
 * A next binding index points to the next style/class binding entry
 * (which is stored inside of `TData`). Next binding indices are used to
 * connect each of the style/class bindings together so that the style/class
 * concatenation algorithm can keep track of concatenated values.
 *
 * When a next binding index is set, the first few bits will be reserved
 * to keep track of styling flags. These flags are stripped out (using bit
 * shifting) when this function is called.
 */
export function getNextBindingIndex(tData: TData, bindingIndex: number): number {
  const value = getBindingConfigAndPointers(tData, bindingIndex);
  return (value & TDataStylingIndex.NextIndexMask) >> TDataStylingIndex.TotalBitsBeforeNextIndex;
}

/**
 * Registers the the binding prop name and suffix in the `TData` at the provided index
 */
export function setBindingProp(
    tData: TData, bindingIndex: number, prop: string | null, suffix: string | null,
    sanitizer: StyleSanitizeFn | null, isClassBased: boolean): void {
  prop = (!isClassBased && prop !== null) ? hyphenate(prop) : prop;
  const value: string|TStyleProperty =
      (suffix || !prop || sanitizer) ? {prop, suffix, sanitizer} : prop;
  tData[bindingIndex] = value;
}

/**
 * Returns the property name at the given index within the `TData`.
 *
 * Bindings that contain suffix values or `null` properties are stored as objects
 * within `TData`. This function will return the property name (so that the object
 * doesn't have to be looked at).
 */
export function getBindingPropName(tData: TData, bindingIndex: number): string|null {
  const result = tData[bindingIndex] as null | string | TStyleProperty;
  return result !== null && typeof result === 'object' ? result.prop : result;
}

/**
 * Returns the suffix value at the given index within the `TData`.
 *
 * Bindings that contain suffix values or `null` properties are stored as objects
 * within `TData`. This function will return the suffix value (so that the object
 * doesn't have to be looked at).
 *
 * The suffix value refers to any style binding that contains a suffix (unit)
 * value for its property (e.g. `<div [style.width.px]="w">`).
 */
export function getStyleBindingSuffix(tData: TData, bindingIndex: number): string {
  const result = tData[bindingIndex];
  return (typeof result !== 'string' && (result as TStyleProperty).suffix) || '';
}

export function getBindingSanitizer(tData: TData, bindingIndex: number): StyleSanitizeFn|null {
  const result = tData[bindingIndex];
  return typeof result !== 'string' ? (result as TStyleProperty).sanitizer : null;
}

/**
 * Sets the next or previous pointer index for an entry in `TData` at the given index.
 */
export function setBindingPointer(
    tData: TData, bindingIndex: number, indexValue: number, isPreviousIndex: boolean): void {
  let value = tData[bindingIndex + 1] as number;
  value &= isPreviousIndex ?
      ~TDataStylingIndex.PreviousIndexMask :
      ~TDataStylingIndex.NextIndexMask;  // delete all the bits for this value
  value |= indexValue
      << (isPreviousIndex ? TDataStylingIndex.TotalBitsBeforePreviousIndex :
                            TDataStylingIndex.TotalBitsBeforeNextIndex);
  tData[bindingIndex + 1] = value;
}

/**
 * Sets the configuration values for an entry in `TData` at the given index.
 */
export function setBindingConfig(
    tData: TData, bindingIndex: number, flags: TDataStylingFlags): void {
  (tData[bindingIndex + 1] as number) |= flags & TDataStylingFlags.Mask;
}

/**
 * Gets the concatenated binding value for a binding location in the `LView`.
 *
 * Concatenated values are used in the concatenation styling algorithm to store
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
 *   'width:100px' // CONCATENATED VALUE (in this case just `width`)
 *
 *   // ...
 *   '200px', // BINDING VALUE
 *   'width:100px; height:200px' // CONCATENATED VALUE (in this case `width` and `height`)
 * ]
 * ```
 */
export function getConcatenatedValue(lView: LStylingData, bindingIndex: number): string {
  const value = lView[bindingIndex + 1];

  // `TData` may store `NO_CHANGE` entries in the cells at a given spot
  // for this reason we need to verify it's a string value.
  return typeof value === 'string' ? value : '';
}

/**
 * Updates the concatenated binding value for a binding location in the `LView`.
 *
 * See [getConcatenatedValue].
 */
export function setConcatenatedValue(
    lView: LStylingData, bindingIndex: number, value: string): void {
  lView[bindingIndex + 1] = value;
}

/**
 * Registers and renders all style and class values contained within the provided `attrs` array.
 *
 * When an element is created it will be created with a list of attributes that
 * include properties, inputs and bindings. Within these attribute entries there
 * may be style and class values. This function will loop over the attrs array,
 * find each class/style entry and render them on the element. It will also
 * concatenate together a final className/style string value and place that
 * on the `tNode/classes` or `tNode.styles` value.
 *
 * The reason why this function does both registration and rendering is to avoid
 * having to store all "new" style/class values (values that are not already
 * apart of `tNode.classes` or `tNode.styles`) in an array. What will happen
 * instead is they will be applied to the element as soon as they are encountered.
 */
export function registerAndRenderInitialStyling(
    renderer: Renderer3, tNode: TNode, native: RElement | null, attrs: TAttributes,
    startIndex: number, appendOnly: boolean): void {
  let mode = -1;
  let stylesStr: string = '';
  let classesStr: string = '';
  let initialStyleNames = tNode.initialStyleNames || [];
  const appendStyles = appendOnly || hasInitialStyling(tNode, false);
  const appendClasses = appendOnly || hasInitialStyling(tNode, true);

  for (let i = startIndex; i < attrs.length; i++) {
    const attr = attrs[i] as string;
    if (typeof attr == 'number') {
      mode = attr;
    } else if (mode == AttributeMarker.Classes) {
      const registerClasses = appendClasses ? !hasInitialClass(tNode, attr) : true;
      if (registerClasses) {
        classesStr = concatString(classesStr, attr, CLASS_ENTRIES_SEPARATOR);
        if (native && appendClasses) {
          setClass(renderer, native, attr, true);
        }
      }
    } else if (mode == AttributeMarker.Styles) {
      const registerStyle = appendStyles ? !hasInitialStyle(tNode, attr) : true;
      if (registerStyle) {
        initialStyleNames.push(attr);
        const value = attrs[++i] as string;
        stylesStr = concatString(stylesStr, concatStyle(attr, value), STYLE_ENTRIES_SEPARATOR);
        if (native && appendStyles) {
          setStyle(renderer, native, attr, value);
        }
      }
    }
  }

  if (stylesStr.length !== 0) {
    // we add the styles in reverse so the template-level styles override
    // the styles any directive styling (the template-level styles are
    // always added first)
    tNode.styles = concatString(stylesStr, tNode.styles, STYLE_ENTRIES_SEPARATOR);
    tNode.initialStyleNames = initialStyleNames;
    if (native && !appendStyles) {
      setStyleAttr(renderer, native, tNode.styles);
    }
  }

  if (classesStr.length !== 0) {
    // we add the classes in reverse so the template-level classes show
    // up at the end of the className string (so that the behavior matches
    // what the style attribute looks like)
    tNode.classes = concatString(classesStr, tNode.classes, CLASS_ENTRIES_SEPARATOR);
    if (native && !appendClasses) {
      setClassName(renderer, native, tNode.classes);
    }
  }
}

/**
 * Whether or not the provided `prop` has an initial value.
 *
 * For example:
 *
 * ```html
 * <!-- fn(tNode, 'width') returns true -->
 * <div style="width:200px"></div>
 *
 * <!-- fn(tNode, 'width') returns false -->
 * <divc class="height:400px"></div>
 * ```
 */
export function hasInitialStyle(tNode: TNode, prop: string): boolean {
  return tNode.initialStyleNames ? tNode.initialStyleNames.indexOf(prop) !== -1 : false;
}

/**
 * Whether or not the provided `className` is apart of the elements initial classes list.
 *
 * For example:
 *
 * ```html
 * <!-- fn(tNode, 'foo') returns true -->
 * <div class="foo"></div>
 *
 * <!-- fn(tNode, 'foo') returns false -->
 * <div class="bar"></div>
 * ```
 */
export function hasInitialClass(tNode: TNode, prop: string): boolean {
  const classes = tNode.classes;
  if (classes === null || classes === '') return false;
  const index = classes === null ? -1 : classes.indexOf(prop);
  if (index >= 0) {
    // we found it now check to make sure we are not a substring.
    let end = index + prop.length;
    return (  // word break before
               index === 0 || classes.charCodeAt(index - 1) <= CharCode.SPACE) &&
        (  // word break after
               end === classes.length || classes.charCodeAt(end + 1) <= CharCode.SPACE);
  } else {
    return false;
  }
}

/**
 * Total bits used for a head or tail index value in `tNode.classesBindingIndex` or
 * `tNode.stylesBindingIndex`
 */
const STYLING_INDEX_BITS = 16;

/**
 * A bit mask of 16 bits used to track the head or tail index value in `tNode.classesBindingIndex`
 * or `tNode.stylesBindingIndex`
 */
const STYLING_INDEX_MASK = 0xFFFF;

/**
 * Returns the head index value used for all style/class bindings on the provided `tNode`
 */
export function getStylingHead(tNode: TNode, isClassBased: boolean) {
  const index = isClassBased ? tNode.classesBindingIndex : tNode.stylesBindingIndex;
  return (index >> STYLING_INDEX_BITS) & STYLING_INDEX_MASK;
}

/**
 * Returns the tail index value used for all style/class bindings on the provided `tNode`
 */
export function getStylingTail(tNode: TNode, isClassBased: boolean) {
  const index = isClassBased ? tNode.classesBindingIndex : tNode.stylesBindingIndex;
  return index & STYLING_INDEX_MASK;
}

/**
 * Marks `tNode.classes` or `tNode.styles` with the head and tail index for the style/class bindings
 * list
 */
export function setStylingHeadTail(
    tNode: TNode, head: number, tail: number, isClassBased: boolean): void {
  const value = ((head & STYLING_INDEX_MASK) << STYLING_INDEX_BITS) | (tail & STYLING_INDEX_MASK);
  if (isClassBased) {
    tNode.classesBindingIndex = value;
  } else {
    tNode.stylesBindingIndex = value;
  }
}

/**
 * Renders all initial styling (class and style values) on to the element from the tNode.
 *
 * All initial styling data (i.e. any values extracted from the `style` or `class` attributes
 * on an element) are collected into the `tNode.styles` and `tNode.classes` data structures.
 * These values are populated during the creation phase of an element and are then later
 * applied once the element is instantiated. This function applies each of the static
 * style and class entries to the element.
 */
export function renderInitialStyling(
    renderer: Renderer3, native: RElement, tNode: TNode, append: boolean) {
  if (hasInitialStyling(tNode, true)) {
    setClassName(renderer, native, tNode.classes !);
  }
  if (hasInitialStyling(tNode, false)) {
    setStyleAttr(renderer, native, tNode.styles !);
  }
}

/**
 * Whether or not the provided `value` is a key/value map or not
 */
export function isStylingMap(value: {} | string | null): value is {} {
  return value !== null && typeof value === 'object';
}

/**
 * Whether or not there are any initial style and/or class values present on the provided `tNode`
 */
export function hasInitialStyling(tNode: TNode, isClassBased: boolean): boolean {
  const value = isClassBased ? tNode.classes : tNode.styles;
  return value !== null;
}

/**
 * Whether or not the registered styling binding within `tData` is a map-based entry or not
 */
export function isMapBasedBinding(tData: TData, bindingIndex: number): boolean {
  return getBindingPropName(tData, bindingIndex) === null;
}

/**
 * Whether or not the "class" or "style" properties are used by a directive on the provided `tNode`.
 *
 * If a directive is attached to an element that contains input bindings for
 * `[style]` or `[class]` properties then the `tNode` that houses that element
 * will be marked as having style and/or class properties. This function helps
 * determine whether that's true or false for the provided `tNode`.
 */
export function hasDirectiveInput(tNode: TNode, isClassBased: boolean): boolean {
  return isClassBased ? hasClassInput(tNode) : hasStyleInput(tNode);
}

/**
 * Returns the next style/class binding index value and rolls the cursor forward by two slots.
 *
 * All style/class bindings use two slots within the lView:
 * - slot 1) the binding value
 * - slot 2) the style/class concatenation value that is
 *   constructed when styling is flushed to the element
 */
export function nextStylingBindingIndex(): number {
  return incrementBindingIndex(2);
}

/**
 * Returns the appropriate directive input value for `style` or `class`.
 *
 * Earlier versions of Angular expect a binding value to be passed into directive code
 * exactly as it is unless there is a static value present (in which case both values
 * will be stringified and concatenated).
 */
export function normalizeStylingDirectiveInputValue(
    initialValue: string | null, bindingValue: string | {[key: string]: any} | null,
    isClassBased: boolean): string|{[key: string]: any}|null {
  let value = bindingValue;

  // we only concat values if there is an initial value, otherwise we return the value as is.
  // Note that this is to satisfy backwards-compatibility in Angular.
  if (initialValue !== null && initialValue !== '') {
    if (isClassBased) {
      value =
          concatString(initialValue, forceClassesAsString(bindingValue), CLASS_ENTRIES_SEPARATOR);
    } else {
      value = concatString(initialValue, forceStylesAsString(bindingValue, true), ';');
    }
  }
  return value;
}

/**
 * Checks whether or not there is a value change between the provided values and throws an error if
 * true
 */
export function checkStylingValueNoChanges(
    prop: string | null, oldValue: any, newValue: any): void {
  const valueHasChanged = prop === null ? hasValueChanged(oldValue, newValue) :
                                          hasValueChangedUnwrapSafeValue(oldValue, newValue);
  if (valueHasChanged) {
    throwErrorIfNoChangesMode(false, oldValue, newValue);
  }
}
