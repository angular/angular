/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {unwrapSafeValue} from '../../sanitization/bypass';
import {StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {CharCode} from '../../util/char_code';
import {throwErrorIfNoChangesMode} from '../errors';
import {setInputsForProperty} from '../instructions/shared';
import {AttributeMarker, PropertyAliases, TAttributes, TNode, TNodeFlags} from '../interfaces/node';
import {RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {LStylingData, TDataStylingFlags, TDataStylingIndex, TStylingNode} from '../interfaces/styling';
import {LView, TData} from '../interfaces/view';
import {getCurrentStyleSanitizer, incrementBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';

export const TEMPLATE_DIRECTIVE_INDEX = 0;

// classOne-wSEPARATOR-classTwo
export const CLASS_ENTRIES_SEPARATOR = ' ';

// propAndValue-SEPARATOR-propAndValue
export const STYLE_ENTRIES_SEPARATOR = '; ';

// prop-SEPARATOR-value
const STYLE_PROP_VALUE_SEPARATOR = ': ';

export function hasConfig(tNode: TStylingNode, flag: TNodeFlags) {
  return (tNode.flags & flag) !== 0;
}

export function patchConfig(tNode: TStylingNode, flag: TNodeFlags): void {
  tNode.flags |= flag;
}

export function setValue(data: LStylingData, bindingIndex: number, value: any) {
  data[bindingIndex] = value;
}

export function getValue<T = any>(data: LStylingData, bindingIndex: number): T|null {
  return bindingIndex !== 0 ? data[bindingIndex] as T : null;
}

export function hasValueChangedUnwrapSafeValue(
    a: NO_CHANGE | number | String | string | null | boolean | undefined | {},
    b: NO_CHANGE | number | String | string | null | boolean | undefined | {}): boolean {
  return hasValueChanged(unwrapSafeValue(a), unwrapSafeValue(b));
}


export function hasValueChanged(
    a: NO_CHANGE | number | string | null | boolean | undefined | {},
    b: NO_CHANGE | number | string | null | boolean | undefined | {}): boolean {
  if (b === NO_CHANGE) return false;
  return !Object.is(a, b);
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

export function concatString(a: string, b: string, separator = CLASS_ENTRIES_SEPARATOR): string {
  return a + ((b.length && a.length) ? separator : '') + b;
}

const LOWERCASE_CHAR_BIT = 32;

export function hyphenate(str: string) {
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

export function hasClassInput(tNode: TStylingNode) {
  return (tNode.flags & TNodeFlags.hasClassInput) !== 0;
}

export function hasStyleInput(tNode: TStylingNode) {
  return (tNode.flags & TNodeFlags.hasStyleInput) !== 0;
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
export function concatStyle(prop: string, value: string) {
  return `${prop}${STYLE_PROP_VALUE_SEPARATOR}${value}`;
}

/**
 * Appends a style/class entry (className or prop:value) to the provided `str` value
 */
export function concatStylingEntry(
    lhs: string, prop: string, value: string | boolean, isClassBased: boolean) {
  const separator = isClassBased ? CLASS_ENTRIES_SEPARATOR : STYLE_ENTRIES_SEPARATOR;
  const entry = isClassBased ? prop : concatStyle(prop, value as string);
  return `${lhs}${lhs.length !== 0 ? separator : ''}${entry}`;
}

/**
 * Assigns a style value to a style property for the given element.
 */
export function setStyle(
    renderer: Renderer3, native: RElement, prop: string, value: string | null) {
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
 */
export function setClass(renderer: Renderer3, native: RElement, className: string, value: any) {
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
export const setClassName = (renderer: Renderer3, native: RElement, className: string) => {
  ngDevMode && ngDevMode.rendererSetClassName++;
  if (isProceduralRenderer(renderer)) {
    renderer.setAttribute(native, 'class', className);
  } else {
    native.className = className;
  }
};

/**
 * Sets the provided style value to the provided element's `style` attribute.
 */
export const setStyleAttr = (renderer: Renderer3, native: RElement, value: string) => {
  ngDevMode && ngDevMode.rendererSetStyle++;
  if (isProceduralRenderer(renderer)) {
    renderer.setAttribute(native, 'style', value);
  } else {
    native.setAttribute('style', value);
  }
};

export function isDirectSanitizationRequired(tData: TData, bindingIndex: number) {
  return ((tData[bindingIndex + 1] as number) & TDataStylingFlags.SanitizationRequiredFlag) !== 0;
}

export function isHostBinding(tData: TData, bindingIndex: number) {
  return ((tData[bindingIndex + 1] as number) & TDataStylingFlags.IsHostBinding) !== 0;
}

export function isDuplicateBinding(tData: TData, bindingIndex: number) {
  return ((tData[bindingIndex + 1] as number) & TDataStylingFlags.IsDuplicateBinding) !== 0;
}

/**
 * Gets the previous style/class index that was registered just before the provided `bindingIndex`
 *
 * A previous binding index points to the previous style/class binding entry
 * (which is stored inside of `TData`). Previous binding indices are used to
 * connect each of the style/class bindings together so that the direct-write
 * algorithm can keep track of concatenated values.
 *
 * When a previous binding index is set, the first few bits will be reserved
 * to keep track of styling flags. These flags are stripped out (using bit
 * shifting) when this function is called.
 */
export function getPreviousBindingIndex(tData: TData, bindingIndex: number) {
  const value = tData[bindingIndex + 1] as number;
  return (value & TDataStylingIndex.PreviousIndexMask) >>
      TDataStylingIndex.TotalBitsBeforePreviousIndex;
}

export function getNextBindingIndex(tData: TData, bindingIndex: number) {
  const value = tData[bindingIndex + 1] as number;
  return (value & TDataStylingIndex.NextIndexMask) >> TDataStylingIndex.TotalBitsBeforeNextIndex;
}

/**
 * Sets the provided style/class binding entry to point to the provided `previousBindingIndex`
 */
export function setBindingConfigAndPointers(
    tData: TData, bindingIndex: number, nextIndex: number, previousIndex: number,
    sanitizationRequired: boolean, hostBindingsMode: boolean) {
  tData[bindingIndex + 1] = TDataStylingFlags.Initial;
  if (sanitizationRequired) {
    setBindingConfig(tData, bindingIndex, TDataStylingFlags.SanitizationRequiredFlag);
  }
  if (hostBindingsMode) {
    setBindingConfig(tData, bindingIndex, TDataStylingFlags.IsHostBinding);
  }
  if (previousIndex !== 0) {
    setBindingPointer(tData, bindingIndex, previousIndex, true);
  }
  if (nextIndex !== 0) {
    setBindingPointer(tData, bindingIndex, nextIndex, false);
  }
}

interface PropAndSuffixEntry {
  prop: string|null;
  suffix: string;
}

export function setBindingPropName(
    tData: TData, bindingIndex: number, prop: string | null, suffix: string | null,
    isClassBased: boolean) {
  prop = (!isClassBased && prop !== null) ? hyphenate(prop) : prop;
  const value = suffix || !prop ? {prop, suffix} : prop;
  tData[bindingIndex] = value;
}

export function getBindingPropName(tData: TData, bindingIndex: number) {
  const result = tData[bindingIndex];
  return typeof result !== 'string' ? (result as PropAndSuffixEntry).prop : result;
}

export function getBindingPropSuffix(tData: TData, bindingIndex: number) {
  const result = tData[bindingIndex];
  return typeof result !== 'string' ? (result as PropAndSuffixEntry).suffix : '';
}

export function setBindingPointer(
    tData: TData, bindingIndex: number, indexValue: number, isPreviousIndex: boolean) {
  let value = tData[bindingIndex + 1] as number;
  value &= isPreviousIndex ?
      ~TDataStylingIndex.PreviousIndexMask :
      ~TDataStylingIndex.NextIndexMask;  // delete all the bits for this value
  value |= indexValue
      << (isPreviousIndex ? TDataStylingIndex.TotalBitsBeforePreviousIndex :
                            TDataStylingIndex.TotalBitsBeforeNextIndex);
  tData[bindingIndex + 1] = value;
}

export function setBindingConfig(tData: TData, bindingIndex: number, flags: TDataStylingFlags) {
  (tData[bindingIndex + 1] as number) |= flags & TDataStylingFlags.Mask;
}

/**
 * Gets the concatenated binding value for a binding location in the `LView`.
 *
 * Concatenated values are used in the direct-write styling algorithm to store
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
  return typeof value === 'string' ? value : '';
}

/**
 * Updates the concatenated binding value for a binding location in the `LView`.
 *
 * See [getConcatenatedValue].
 */
export function setConcatenatedValue(lView: LStylingData, bindingIndex: number, value: string) {
  lView[bindingIndex + 1] = value;
}

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

export function hasInitialStyle(tNode: TNode, prop: string) {
  return tNode.initialStyleNames ? tNode.initialStyleNames.indexOf(prop) !== -1 : false;
}

export function hasInitialClass(tNode: TNode, prop: string) {
  return tNode.classes.length !== 0 ? tNode.classes.indexOf(` ${prop} `) !== -1 : false;
}

const STYLING_INDEX_BITS = 16;
const STYLING_INDEX_MASK = 0xFFFF;
export function getStylingHead(tNode: TStylingNode, isClassBased: boolean) {
  const index = isClassBased ? tNode.classesBindingIndex : tNode.stylesBindingIndex;
  return (index >> STYLING_INDEX_BITS) & STYLING_INDEX_MASK;
}

export function getStylingTail(tNode: TStylingNode, isClassBased: boolean) {
  const index = isClassBased ? tNode.classesBindingIndex : tNode.stylesBindingIndex;
  return index & STYLING_INDEX_MASK;
}

export function setStylingHeadTail(
    tNode: TNode, head: number, tail: number, isClassBased: boolean) {
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
    setClassName(renderer, native, tNode.classes);
  }
  if (hasInitialStyling(tNode, false)) {
    setStyleAttr(renderer, native, tNode.styles);
  }
}

export function isStylingMap(value: any): value is {} {
  return value !== null && typeof value !== 'string';
}

export function hasInitialStyling(tNode: TNode, isClassBased: boolean): boolean {
  return (isClassBased ? tNode.classes : tNode.styles).length !== 0;
}

export function isMapBasedBinding(tData: TData, bindingIndex: number) {
  return getBindingPropName(tData, bindingIndex) === null;
}

/**
 * Used to print each of the style/class bindings attached to the given node.
 */
export function printStylingSources(
    tNode: TStylingNode, tData: TData, isClassBased: boolean): void {
  let bindingIndex = getStylingHead(tNode, isClassBased);
  let hostBindingsMode = false;
  let isFirstItem = true;
  let str = '';
  while (bindingIndex !== 0) {
    if (!hostBindingsMode && isHostBinding(tData, bindingIndex)) {
      hostBindingsMode = true;
      isFirstItem = true;
    }
    if (isFirstItem) {
      if (hostBindingsMode) {
        str += '\n\nHOST BINDINGS:\n';
      } else {
        str += '\n\nTEMPLATE BINDINGS:\n';
      }
    }

    isFirstItem = false;
    const prop = getBindingPropName(tData, bindingIndex) || 'MAP';
    const suffix = getBindingPropSuffix(tData, bindingIndex);
    const name = suffix ? `${prop}.${suffix}` : prop;
    str += `  ${getPrintedBindingName(name, hostBindingsMode)}: ${bindingIndex}\n`;
    bindingIndex = getNextBindingIndex(tData, bindingIndex);
  }

  /* tslint:disable */
  console.log(str);
}

function getPrintedBindingName(name: string, isHostBinding: boolean) {
  return isHostBinding ? `@HostBinding("${name}")` : `[${name}]`;
}

export function printStylingTable(
    tData: TData, tNode: TStylingNode, lView: LStylingData, isClassBased: boolean) {
  const head = getStylingHead(tNode, isClassBased);
  const tail = getStylingTail(tNode, isClassBased);

  let bindingIndex = head;
  const entries = [];

  const initial = isClassBased ? tNode.classes : tNode.styles;
  entries.push({prop: 'HEAD', index: null, value: head});
  entries.push({prop: 'TAIL', index: null, value: tail});

  entries.push({prop: 'INITIAL', index: null, value: initial});

  entries.push({});

  while (bindingIndex !== 0) {
    const next = getNextBindingIndex(tData, bindingIndex);
    let prop = tData[bindingIndex] as string || '[MAP]';
    if (isHostBinding(tData, bindingIndex)) {
      prop = `*${prop}`;
    }

    const previous = getPreviousBindingIndex(tData, bindingIndex);
    entries.push({
      prop,
      index: bindingIndex,
      value: getValue(lView, bindingIndex),
      concatenatedValue: getConcatenatedValue(lView, bindingIndex),
      indices: `${previous} | ${next}`,
    });

    bindingIndex = next;
  }

  /* tslint:disable */
  console.table(entries);
}

export function isSanitizationRequired(prop: string | null, isClassBased: boolean) {
  let required: boolean;
  if (isClassBased) {
    // Case #1: classes cannot be sanitized
    required = false;
  } else if (prop === null) {
    // Case #2: map-based styles are always sanitized
    required = true;
  } else {
    // Case #3: prop-based styles need to be validated
    const sanitizer = getCurrentStyleSanitizer();
    required = sanitizer ? sanitizer(prop !, null, StyleSanitizeMode.ValidateProperty) : false;
  }
  return required;
}

export function hasDirectiveInput(tNode: TNode, isClassBased: boolean) {
  return isClassBased ? hasClassInput(tNode) : hasStyleInput(tNode);
}

/**
 * Returns the next style/class binding index value and rolls the cursor forward by two slots.
 *
 * All style/class bindings use two slots within the
 * lView: one for the value and another for an intermediate
 * value that is constructed after each binding runs.
 */
export function nextStylingBindingIndex() {
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
    initialValue: string, bindingValue: string | {[key: string]: any} | null,
    isClassBased: boolean) {
  let value = bindingValue;

  // we only concat values if there is an initial value, otherwise we return the value as is.
  // Note that this is to satisfy backwards-compatibility in Angular.
  if (initialValue.length) {
    if (isClassBased) {
      value = concatString(initialValue, forceClassesAsString(bindingValue));
    } else {
      value = concatString(initialValue, forceStylesAsString(bindingValue, true), ';');
    }
  }
  return value;
}

/**
 * Writes a value to a directive's `style` or `class` input binding (if it has changed).
 *
 * If a directive has a `@Input` binding that is set on `style` or `class` then that value
 * will take priority over the underlying style/class styling bindings. This value will
 * be updated for the binding each time during change detection.
 *
 * When this occurs this function will attempt to write the value to the input binding
 * depending on the following situations:
 *
 * - If `oldValue !== newValue`
 * - If `newValue` is `null` (but this is skipped if it is during the first update pass)
 */
export function updateDirectiveInputValue(
    lView: LView, tNode: TNode, bindingIndex: number, newValue: any, isClassBased: boolean,
    firstUpdatePass: boolean): boolean {
  let flushRequired = false;
  const oldValue = getValue(lView, bindingIndex);
  if (hasValueChanged(oldValue, newValue)) {
    // even if the value has changed we may not want to emit it to the
    // directive input(s) in the event that it is falsy during the
    // first update pass.
    if (isStylingValueDefined(newValue) || !firstUpdatePass) {
      const inputName: string = isClassBased ? selectClassBasedInputName(tNode.inputs !) : 'style';
      const inputs = tNode.inputs ![inputName] !;
      const initialValue = isClassBased ? tNode.classes : tNode.styles;
      const value = normalizeStylingDirectiveInputValue(initialValue, newValue, isClassBased);
      setInputsForProperty(lView, inputs, inputName, value);
      flushRequired = true;
    }
    setValue(lView, bindingIndex, newValue);
  }
  return flushRequired;
}

export function checkStylingValueNoChanges(prop: string | null, oldValue: any, newValue: any) {
  const valueHasChanged = prop === null ? hasValueChanged(oldValue, newValue) :
                                          hasValueChangedUnwrapSafeValue(oldValue, newValue);
  if (valueHasChanged) {
    throwErrorIfNoChangesMode(false, oldValue, newValue);
  }
}
