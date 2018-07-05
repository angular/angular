/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InitialStylingFlags} from './interfaces/definition';
import {LElementNode} from './interfaces/node';
import {Renderer3, RendererStyleFlags3, isProceduralRenderer} from './interfaces/renderer';

/**
 * The styling context acts as a styling manifest (shaped as an array) for determining which
 * styling properties have been assigned via the provided `updateStyleMap` and `updateStyleProp`
 * functions. There are also two initialization functions `allocStylingContext` and
 * `createStylingContextTemplate` which are used to initialize and/or clone the context.
 *
 * The context is an array where the first two cells are used for static data (initial styling)
 * and dirty flags / index offsets). The remaining set of cells is used for multi (map) and single
 * (prop) style values.
 *
 * each value from here onwards is mapped as so:
 * [i] = mutation/type flag for the style value
 * [i + 1] = prop string (or null incase it has been removed)
 * [i + 2] = value string (or null incase it has been removed)
 *
 * There are three types of styling types stored in this context:
 *   initial: any styles that are passed in once the context is created
 *            (these are stored in the first cell of the array and the first
 *             value of this array is always `null` even if no initial styles exist.
 *             the `null` value is there so that any new styles have a parent to point
 *             to. This way we can always assume that there is a parent.)
 *
 *   single: any styles that are updated using `updateStyleProp` (fixed set)
 *
 *   multi: any styles that are updated using `updateStyleMap` (dynamic set)
 *
 * Note that context is only used to collect style information. Only when `renderStyles`
 * is called is when the styling payload will be rendered (or built as a key/value map).
 *
 * When the context is created, depending on what initial styles are passed in, the context itself
 * will be pre-filled with slots based on the initial style properties. Say for example we have a
 * series of initial styles that look like so:
 *
 *   style="width:100px; height:200px;"
 *
 * Then the initial state of the context (once initialized) will look like so:
 *
 * ```
 * context = [
 *   [null, '100px', '200px'],  // property names are not needed since they have already been
 * written to DOM.
 *
 *   configMasterVal,
 *
 *   // 2
 *   'width',
 *   pointers(1, 8);  // Point to static `width`: `100px` and multi `width`.
 *   null,
 *
 *   // 5
 *   'height',
 *   pointers(2, 11); // Point to static `height`: `200px` and multi `height`.
 *   null,
 *
 *   // 8
 *   'width',
 *   pointers(1, 2);  // Point to static `width`: `100px` and single `width`.
 *   null,
 *
 *   // 11
 *   'height',
 *   pointers(2, 5);  // Point to static `height`: `200px` and single `height`.
 *   null,
 * ]
 *
 * function pointers(staticIndex: number, dynamicIndex: number) {
 *   // combine the two indices into a single word.
 *   return (staticIndex << StylingFlags.BitCountSize) |
 *     (dynamicIndex << (StylingIndex.BitCountSize + StylingFlags.BitCountSize));
 * }
 * ```
 *
 * The values are duplicated so that space is set aside for both multi ([style])
 * and single ([style.prop]) values. The respective config values (configValA, configValB, etc...)
 * are a combination of the StylingFlags with two index values: the `initialIndex` (which points to
 * the index location of the style value in the initial styles array in slot 0) and the
 * `dynamicIndex` (which points to the matching single/multi index position in the context array
 * for the same prop).
 *
 * This means that every time `updateStyleProp` is called it must be called using an index value
 * (not a property string) which references the index value of the initial style when the context
 * was created. This also means that `updateStyleProp` cannot be called with a new property
 * (only `updateStyleMap` can include new CSS properties that will be added to the context).
 */
export interface StylingContext extends Array<InitialStyles|number|string|null> {
  /**
   * Location of initial data shared by all instances of this style.
   */
  [0]: InitialStyles;

  /**
   * A numeric value representing the configuration status (whether the context is dirty or not)
   * mixed together (using bit shifting) with a index value which tells the starting index value
   * of where the multi style entries begin.
   */
  [1]: number;
}

/**
 * The initial styles is populated whether or not there are any initial styles passed into
 * the context during allocation. The 0th value must be null so that index values of `0` within
 * the context flags can always point to a null value safely when nothing is set.
 *
 * All other entries in this array are of `string` value and correspond to the values that
 * were extracted from the `style=""` attribute in the HTML code for the provided template.
 */
export interface InitialStyles extends Array<string|null> { [0]: null; }

/**
 * Used to set the context to be dirty or not both on the master flag (position 1)
 * or for each single/multi property that exists in the context.
 */
export const enum StylingFlags {
  // Implies no configurations
  None = 0b0,
  // Whether or not the entry or context itself is dirty
  Dirty = 0b1,
  // The max amount of bits used to represent these configuration values
  BitCountSize = 1,
}

/** Used as numeric pointer values to determine what cells to update in the `StylingContext` */
export const enum StylingIndex {
  // Position of where the initial styles are stored in the styling context
  InitialStylesPosition = 0,
  // Index of location where the start of single properties are stored. (`updateStyleProp`)
  MasterFlagPosition = 1,
  // Location of single (prop) value entries are stored within the context
  SingleStylesStartPosition = 2,
  // Multi and single entries are stored in `StylingContext` as: Flag; PropertyName;  PropertyValue
  FlagsOffset = 0,
  PropertyOffset = 1,
  ValueOffset = 2,
  // Size of each multi or single entry (flag + prop + value)
  Size = 3,
  // Each flag has a binary digit length of this value
  BitCountSize = 15,  // (32 - 1) / 2 = ~15
  // The binary digit value as a mask
  BitMask = 0b111111111111111  // 15 bits
}

/**
 * Used clone a copy of a pre-computed template of a styling context.
 *
 * A pre-computed template is designed to be computed once for a given element
 * (instructions.ts has logic for caching this).
 */
export function allocStylingContext(templateStyleContext: StylingContext): StylingContext {
  // each instance gets a copy
  return templateStyleContext.slice() as any as StylingContext;
}

/**
 * Creates a styling context template where styling information is stored.
 * Any styles that are later referenced using `updateStyleProp` must be
 * passed in within this function. Initial values for those styles are to
 * be declared after all initial style properties are declared (this change in
 * mode between declarations and initial styles is made possible using a special
 * enum value found in `definition.ts`).
 *
 * @param initialStyleDeclarations a list of style declarations and initial style values
 *    that are used later within the styling context.
 *
 *    -> ['width', 'height', SPECIAL_ENUM_VAL, 'width', '100px']
 *       This implies that `width` and `height` will be later styled and that the `width`
 *       property has an initial value of `100px`.
 */
export function createStylingContextTemplate(
    initialStyleDeclarations?: (string | InitialStylingFlags)[] | null): StylingContext {
  const initialStyles: InitialStyles = [null];
  const context: StylingContext = [initialStyles, 0];

  const indexLookup: {[key: string]: number} = {};
  if (initialStyleDeclarations) {
    let hasPassedDeclarations = false;
    for (let i = 0; i < initialStyleDeclarations.length; i++) {
      const v = initialStyleDeclarations[i] as string | InitialStylingFlags;

      // this flag value marks where the declarations end the initial values begin
      if (v === InitialStylingFlags.INITIAL_STYLES) {
        hasPassedDeclarations = true;
      } else {
        const prop = v as string;
        if (hasPassedDeclarations) {
          const value = initialStyleDeclarations[++i] as string;
          initialStyles.push(value);
          indexLookup[prop] = initialStyles.length - 1;
        } else {
          // it's safe to use `0` since the default initial value for
          // each property will always be null (which is at position 0)
          indexLookup[prop] = 0;
        }
      }
    }
  }

  const allProps = Object.keys(indexLookup);
  const totalProps = allProps.length;

  // *2 because we are filling for both single and multi style spaces
  const maxLength = totalProps * StylingIndex.Size * 2 + StylingIndex.SingleStylesStartPosition;

  // we need to fill the array from the start so that we can access
  // both the multi and the single array positions in the same loop block
  for (let i = StylingIndex.SingleStylesStartPosition; i < maxLength; i++) {
    context.push(null);
  }

  const singleStart = StylingIndex.SingleStylesStartPosition;
  const multiStart = totalProps * StylingIndex.Size + StylingIndex.SingleStylesStartPosition;

  // fill single and multi-level styles
  for (let i = 0; i < allProps.length; i++) {
    const prop = allProps[i];

    const indexForInitial = indexLookup[prop];
    const indexForMulti = i * StylingIndex.Size + multiStart;
    const indexForSingle = i * StylingIndex.Size + singleStart;

    setFlag(context, indexForSingle, pointers(StylingFlags.None, indexForInitial, indexForMulti));
    setProp(context, indexForSingle, prop);
    setValue(context, indexForSingle, null);

    setFlag(context, indexForMulti, pointers(StylingFlags.Dirty, indexForInitial, indexForSingle));
    setProp(context, indexForMulti, prop);
    setValue(context, indexForMulti, null);
  }

  // there is no initial value flag for the master index since it doesn't reference an initial style
  // value
  setFlag(context, StylingIndex.MasterFlagPosition, pointers(0, 0, multiStart));
  setContextDirty(context, initialStyles.length > 1);

  return context;
}

const EMPTY_ARR: any[] = [];
/**
 * Sets and resolves all `multi` styles on an `StylingContext` so that they can be
 * applied to the element once `renderStyles` is called.
 *
 * All missing styles (any values that are not provided in the new `styles` param)
 * will resolve to `null` within their respective positions in the context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided style values.
 * @param styles The key/value map of CSS styles that will be used for the update.
 */
export function updateStyleMap(context: StylingContext, styles: {[key: string]: any} | null): void {
  const propsToApply = styles ? Object.keys(styles) : EMPTY_ARR;
  const multiStartIndex = getMultiStartIndex(context);

  let dirty = false;
  let ctxIndex = multiStartIndex;
  let propIndex = 0;

  // the main loop here will try and figure out how the shape of the provided
  // styles differ with respect to the context. Later if the context/styles are
  // off-balance then they will be dealt in another loop after this one
  while (ctxIndex < context.length && propIndex < propsToApply.length) {
    const flag = getPointers(context, ctxIndex);
    const prop = getProp(context, ctxIndex);
    const value = getValue(context, ctxIndex);

    const newProp = propsToApply[propIndex];
    const newValue = styles ![newProp];
    if (prop === newProp) {
      if (value !== newValue) {
        setValue(context, ctxIndex, newValue);
        const initialValue = getInitialValue(context, flag);

        // there is no point in setting this to dirty if the previously
        // rendered value was being referenced by the initial style (or null)
        if (initialValue !== newValue) {
          setDirty(context, ctxIndex, true);
          dirty = true;
        }
      }
    } else {
      const indexOfEntry = findEntryPositionByProp(context, newProp, ctxIndex);
      if (indexOfEntry > 0) {
        // it was found at a later point ... just swap the values
        swapMultiContextEntries(context, ctxIndex, indexOfEntry);
        if (value !== newValue) {
          setValue(context, ctxIndex, newValue);
          dirty = true;
        }
      } else {
        // we only care to do this if the insertion is in the middle
        const doShift = ctxIndex < context.length;
        insertNewMultiProperty(context, ctxIndex, newProp, newValue);
        dirty = true;
      }
    }

    ctxIndex += StylingIndex.Size;
    propIndex++;
  }

  // this means that there are left-over values in the context that
  // were not included in the provided styles and in this case the
  // goal is to "remove" them from the context (by nullifying)
  while (ctxIndex < context.length) {
    const value = context[ctxIndex + StylingIndex.ValueOffset];
    if (value !== null) {
      setDirty(context, ctxIndex, true);
      setValue(context, ctxIndex, null);
      dirty = true;
    }
    ctxIndex += StylingIndex.Size;
  }

  // this means that there are left-over property in the context that
  // were not detected in the context during the loop above. In that
  // case we want to add the new entries into the list
  while (propIndex < propsToApply.length) {
    const prop = propsToApply[propIndex];
    const value = styles ![prop];
    context.push(StylingFlags.Dirty, prop, value);
    propIndex++;
    dirty = true;
  }

  if (dirty) {
    setContextDirty(context, true);
  }
}

/**
 * Sets and resolves a single CSS style on a property on an `StylingContext` so that they
 * can be applied to the element once `renderElementStyles` is called.
 *
 * Note that prop-level styles are considered higher priority than styles that are applied
 * using `updateStyleMap`, therefore, when styles are rendered then any styles that
 * have been applied using this function will be considered first (then multi values second
 * and then initial values as a backup).
 *
 * @param context The styling context that will be updated with the
 *    newly provided style value.
 * @param index The index of the property which is being updated.
 * @param value The CSS style value that will be assigned
 */
export function updateStyleProp(
    context: StylingContext, index: number, value: string | null): void {
  const singleIndex = StylingIndex.SingleStylesStartPosition + index * StylingIndex.Size;
  const currValue = getValue(context, singleIndex);
  const currFlag = getPointers(context, singleIndex);

  // didn't change ... nothing to make a note of
  if (currValue !== value) {
    // the value will always get updated (even if the dirty flag is skipped)
    setValue(context, singleIndex, value);
    const indexForMulti = getMultiOrSingleIndex(currFlag);

    // if the value is the same in the multi-area then there's no point in re-assembling
    const valueForMulti = getValue(context, indexForMulti);
    if (!valueForMulti || valueForMulti !== value) {
      let multiDirty = false;
      let singleDirty = true;

      // only when the value is set to `null` should the multi-value get flagged
      if (value == null && valueForMulti) {
        multiDirty = true;
        singleDirty = false;
      }

      setDirty(context, indexForMulti, multiDirty);
      setDirty(context, singleIndex, singleDirty);
      setContextDirty(context, true);
    }
  }
}

/**
 * Renders all queued styles using a renderer onto the given element.
 *
 * This function works by rendering any styles (that have been applied
 * using `updateStyleMap` and `updateStyleProp`) onto the
 * provided element using the provided renderer. Just before the styles
 * are rendered a final key/value style map will be assembled.
 *
 * @param lElement the element that the styles will be rendered on
 * @param context The styling context that will be used to determine
 *      what styles will be rendered
 * @param renderer the renderer that will be used to apply the styling
 * @param styleStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @returns an object literal. `{ color: 'red', height: 'auto'}`.
 */
export function renderStyles(
    lElement: LElementNode, context: StylingContext, renderer: Renderer3,
    styleStore?: {[key: string]: any}) {
  if (isContextDirty(context)) {
    const native = lElement.native;
    const multiStartIndex = getMultiStartIndex(context);
    for (let i = StylingIndex.SingleStylesStartPosition; i < context.length;
         i += StylingIndex.Size) {
      // there is no point in rendering styles that have not changed on screen
      if (isDirty(context, i)) {
        const prop = getProp(context, i);
        const value = getValue(context, i);
        const flag = getPointers(context, i);
        const isInSingleRegion = i < multiStartIndex;

        let styleToApply: string|null = value;

        // STYLE DEFER CASE 1: Use a multi value instead of a null single value
        // this check implies that a single value was removed and we
        // should now defer to a multi value and use that (if set).
        if (isInSingleRegion && styleToApply == null) {
          // single values ALWAYS have a reference to a multi index
          const multiIndex = getMultiOrSingleIndex(flag);
          styleToApply = getValue(context, multiIndex);
        }

        // STYLE DEFER CASE 2: Use the initial value if all else fails (is null)
        // the initial value will always be a string or null,
        // therefore we can safely adopt it incase there's nothing else
        if (styleToApply == null) {
          styleToApply = getInitialValue(context, flag);
        }

        setStyle(native, prop, styleToApply, renderer, styleStore);
        setDirty(context, i, false);
      }
    }

    setContextDirty(context, false);
  }
}

/**
 * This function renders a given CSS prop/value entry using the
 * provided renderer. If a `styleStore` value is provided then
 * that will be used a render context instead of the provided
 * renderer.
 *
 * @param native the DOM Element
 * @param prop the CSS style property that will be rendered
 * @param value the CSS style value that will be rendered
 * @param renderer
 * @param styleStore an optional key/value map that will be used as a context to render styles on
 */
function setStyle(
    native: any, prop: string, value: string | null, renderer: Renderer3,
    styleStore?: {[key: string]: any}) {
  if (styleStore) {
    styleStore[prop] = value;
  } else if (value == null) {
    ngDevMode && ngDevMode.rendererRemoveStyle++;
    isProceduralRenderer(renderer) ?
        renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
        native['style'].removeProperty(prop);
  } else {
    ngDevMode && ngDevMode.rendererSetStyle++;
    isProceduralRenderer(renderer) ?
        renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
        native['style'].setProperty(prop, value);
  }
}

function setDirty(context: StylingContext, index: number, isDirtyYes: boolean) {
  const adjustedIndex =
      index >= StylingIndex.SingleStylesStartPosition ? (index + StylingIndex.FlagsOffset) : index;
  if (isDirtyYes) {
    (context[adjustedIndex] as number) |= StylingFlags.Dirty;
  } else {
    (context[adjustedIndex] as number) &= ~StylingFlags.Dirty;
  }
}

function isDirty(context: StylingContext, index: number): boolean {
  const adjustedIndex =
      index >= StylingIndex.SingleStylesStartPosition ? (index + StylingIndex.FlagsOffset) : index;
  return ((context[adjustedIndex] as number) & StylingFlags.Dirty) == StylingFlags.Dirty;
}

function pointers(configFlag: number, staticIndex: number, dynamicIndex: number) {
  return (configFlag & StylingFlags.Dirty) | (staticIndex << StylingFlags.BitCountSize) |
      (dynamicIndex << (StylingIndex.BitCountSize + StylingFlags.BitCountSize));
}

function getInitialValue(context: StylingContext, flag: number): string|null {
  const index = getInitialIndex(flag);
  return context[StylingIndex.InitialStylesPosition][index] as null | string;
}

function getInitialIndex(flag: number): number {
  return (flag >> StylingFlags.BitCountSize) & StylingIndex.BitMask;
}

function getMultiOrSingleIndex(flag: number): number {
  const index =
      (flag >> (StylingIndex.BitCountSize + StylingFlags.BitCountSize)) & StylingIndex.BitMask;
  return index >= StylingIndex.SingleStylesStartPosition ? index : -1;
}

function getMultiStartIndex(context: StylingContext): number {
  return getMultiOrSingleIndex(context[StylingIndex.MasterFlagPosition]) as number;
}

function setProp(context: StylingContext, index: number, prop: string) {
  context[index + StylingIndex.PropertyOffset] = prop;
}

function setValue(context: StylingContext, index: number, value: string | null) {
  context[index + StylingIndex.ValueOffset] = value;
}

function setFlag(context: StylingContext, index: number, flag: number) {
  const adjustedIndex =
      index === StylingIndex.MasterFlagPosition ? index : (index + StylingIndex.FlagsOffset);
  context[adjustedIndex] = flag;
}

function getPointers(context: StylingContext, index: number): number {
  const adjustedIndex =
      index === StylingIndex.MasterFlagPosition ? index : (index + StylingIndex.FlagsOffset);
  return context[adjustedIndex] as number;
}

function getValue(context: StylingContext, index: number): string|null {
  return context[index + StylingIndex.ValueOffset] as string | null;
}

function getProp(context: StylingContext, index: number): string {
  return context[index + StylingIndex.PropertyOffset] as string;
}

export function isContextDirty(context: StylingContext): boolean {
  return isDirty(context, StylingIndex.MasterFlagPosition);
}

export function setContextDirty(context: StylingContext, isDirtyYes: boolean): void {
  setDirty(context, StylingIndex.MasterFlagPosition, isDirtyYes);
}

function findEntryPositionByProp(
    context: StylingContext, prop: string, startIndex?: number): number {
  for (let i = (startIndex || 0) + StylingIndex.PropertyOffset; i < context.length;
       i += StylingIndex.Size) {
    const thisProp = context[i];
    if (thisProp == prop) {
      return i - StylingIndex.PropertyOffset;
    }
  }
  return -1;
}

function swapMultiContextEntries(context: StylingContext, indexA: number, indexB: number) {
  const tmpValue = getValue(context, indexA);
  const tmpProp = getProp(context, indexA);
  const tmpFlag = getPointers(context, indexA);

  let flagA = tmpFlag;
  let flagB = getPointers(context, indexB);

  const singleIndexA = getMultiOrSingleIndex(flagA);
  if (singleIndexA >= 0) {
    const _flag = getPointers(context, singleIndexA);
    const _initial = getInitialIndex(_flag);
    setFlag(context, singleIndexA, pointers(_flag, _initial, indexB));
  }

  const singleIndexB = getMultiOrSingleIndex(flagB);
  if (singleIndexB >= 0) {
    const _flag = getPointers(context, singleIndexB);
    const _initial = getInitialIndex(_flag);
    setFlag(context, singleIndexB, pointers(_flag, _initial, indexA));
  }

  setValue(context, indexA, getValue(context, indexB));
  setProp(context, indexA, getProp(context, indexB));
  setFlag(context, indexA, getPointers(context, indexB));

  setValue(context, indexB, tmpValue);
  setProp(context, indexB, tmpProp);
  setFlag(context, indexB, tmpFlag);
}

function updateSinglePointerValues(context: StylingContext, indexStartPosition: number) {
  for (let i = indexStartPosition; i < context.length; i += StylingIndex.Size) {
    const multiFlag = getPointers(context, i);
    const singleIndex = getMultiOrSingleIndex(multiFlag);
    if (singleIndex > 0) {
      const singleFlag = getPointers(context, singleIndex);
      const initialIndexForSingle = getInitialIndex(singleFlag);
      const updatedFlag = pointers(
          isDirty(context, singleIndex) ? StylingFlags.Dirty : StylingFlags.None,
          initialIndexForSingle, i);
      setFlag(context, singleIndex, updatedFlag);
    }
  }
}

function insertNewMultiProperty(
    context: StylingContext, index: number, name: string, value: string): void {
  const doShift = index < context.length;

  // prop does not exist in the list, add it in
  context.splice(index, 0, StylingFlags.Dirty, name, value);

  if (doShift) {
    // because the value was inserted midway into the array then we
    // need to update all the shifted multi values' single value
    // pointers to point to the newly shifted location
    updateSinglePointerValues(context, index + StylingIndex.Size);
  }
}
