/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleSanitizeFn} from '../sanitization/style_sanitizer';
import {InitialStylingFlags} from './interfaces/definition';
import {LElementNode} from './interfaces/node';
import {Renderer3, RendererStyleFlags3, isProceduralRenderer} from './interfaces/renderer';


/**
 * The styling context acts as a styling manifest (shaped as an array) for determining which
 * styling properties have been assigned via the provided `updateStylingMap`, `updateStyleProp`
 * and `updateClassProp` functions. There are also two initialization functions
 * `allocStylingContext` and `createStylingContextTemplate` which are used to initialize
 * and/or clone the context.
 *
 * The context is an array where the first two cells are used for static data (initial styling)
 * and dirty flags / index offsets). The remaining set of cells is used for multi (map) and single
 * (prop) style values.
 *
 * each value from here onwards is mapped as so:
 * [i] = mutation/type flag for the style/class value
 * [i + 1] = prop string (or null incase it has been removed)
 * [i + 2] = value string (or null incase it has been removed)
 *
 * There are three types of styling types stored in this context:
 *   initial: any styles that are passed in once the context is created
 *            (these are stored in the first cell of the array and the first
 *             value of this array is always `null` even if no initial styling exists.
 *             the `null` value is there so that any new styles have a parent to point
 *             to. This way we can always assume that there is a parent.)
 *
 *   single: any styles that are updated using `updateStyleProp` or `updateClassProp` (fixed set)
 *
 *   multi: any styles that are updated using `updateStylingMap` (dynamic set)
 *
 * Note that context is only used to collect style information. Only when `renderStyling`
 * is called is when the styling payload will be rendered (or built as a key/value map).
 *
 * When the context is created, depending on what initial styling values are passed in, the
 * context itself will be pre-filled with slots based on the initial style properties. Say
 * for example we have a series of initial styles that look like so:
 *
 *   style="width:100px; height:200px;"
 *   class="foo"
 *
 * Then the initial state of the context (once initialized) will look like so:
 *
 * ```
 * context = [
 *   element,
 *   styleSanitizer | null,
 *   [null, '100px', '200px', true],  // property names are not needed since they have already been
 * written to DOM.
 *
 *   configMasterVal,
 *   1, // this instructs how many `style` values there are so that class index values can be
 * offsetted
 *   'last class string applied',
 *
 *   // 6
 *   'width',
 *   pointers(1, 15);  // Point to static `width`: `100px` and multi `width`.
 *   null,
 *
 *   // 9
 *   'height',
 *   pointers(2, 18); // Point to static `height`: `200px` and multi `height`.
 *   null,
 *
 *   // 12
 *   'foo',
 *   pointers(1, 21);  // Point to static `foo`: `true` and multi `foo`.
 *   null,
 *
 *   // 15
 *   'width',
 *   pointers(1, 6);  // Point to static `width`: `100px` and single `width`.
 *   null,
 *
 *   // 18
 *   'height',
 *   pointers(2, 9);  // Point to static `height`: `200px` and single `height`.
 *   null,
 *
 *   // 21
 *   'foo',
 *   pointers(3, 12);  // Point to static `foo`: `true` and single `foo`.
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
 * The values are duplicated so that space is set aside for both multi ([style] and [class])
 * and single ([style.prop] or [class.named]) values. The respective config values
 * (configValA, configValB, etc...) are a combination of the StylingFlags with two index
 * values: the `initialIndex` (which points to the index location of the style value in
 * the initial styles array in slot 0) and the `dynamicIndex` (which points to the
 * matching single/multi index position in the context array for the same prop).
 *
 * This means that every time `updateStyleProp` or `updateClassProp` are called then they
 * must be called using an index value (not a property string) which references the index
 * value of the initial style prop/class when the context was created. This also means that
 * `updateStyleProp` or `updateClassProp` cannot be called with a new property (only
 * `updateStylingMap` can include new CSS properties that will be added to the context).
 */
export interface StylingContext extends
    Array<InitialStyles|number|string|boolean|LElementNode|StyleSanitizeFn|null> {
  /**
   * Location of element that is used as a target for this context.
   */
  [0]: LElementNode|null;

  /**
   * The style sanitizer that is used within this context
   */
  [1]: StyleSanitizeFn|null;

  /**
   * Location of initial data shared by all instances of this style.
   */
  [2]: InitialStyles;

  /**
   * A numeric value representing the configuration status (whether the context is dirty or not)
   * mixed together (using bit shifting) with a index value which tells the starting index value
   * of where the multi style entries begin.
   */
  [3]: number;

  /**
   * A numeric value representing the class index offset value. Whenever a single class is
   * applied (using `elementClassProp`) it should have an styling index value that doesn't
   * need to take into account any style values that exist in the context.
   */
  [4]: number;

  /**
   * The last CLASS STRING VALUE that was interpreted by elementStylingMap. This is cached
   * So that the algorithm can exit early incase the string has not changed.
   */
  [5]: string|null;
}

/**
 * The initial styles is populated whether or not there are any initial styles passed into
 * the context during allocation. The 0th value must be null so that index values of `0` within
 * the context flags can always point to a null value safely when nothing is set.
 *
 * All other entries in this array are of `string` value and correspond to the values that
 * were extracted from the `style=""` attribute in the HTML code for the provided template.
 */
export interface InitialStyles extends Array<string|null|boolean> { [0]: null; }

/**
 * Used to set the context to be dirty or not both on the master flag (position 1)
 * or for each single/multi property that exists in the context.
 */
export const enum StylingFlags {
  // Implies no configurations
  None = 0b000,
  // Whether or not the entry or context itself is dirty
  Dirty = 0b001,
  // Whether or not this is a class-based assignment
  Class = 0b010,
  // Whether or not a sanitizer was applied to this property
  Sanitize = 0b100,
  // The max amount of bits used to represent these configuration values
  BitCountSize = 3,
  // There are only three bits here
  BitMask = 0b111
}

/** Used as numeric pointer values to determine what cells to update in the `StylingContext` */
export const enum StylingIndex {
  // Position of where the initial styles are stored in the styling context
  ElementPosition = 0,
  // Position of where the style sanitizer is stored within the styling context
  StyleSanitizerPosition = 1,
  // Position of where the initial styles are stored in the styling context
  InitialStylesPosition = 2,
  // Index of location where the start of single properties are stored. (`updateStyleProp`)
  MasterFlagPosition = 3,
  // Index of location where the class index offset value is located
  ClassOffsetPosition = 4,
  // Position of where the last string-based CSS class value was stored
  CachedCssClassString = 5,
  // Location of single (prop) value entries are stored within the context
  SingleStylesStartPosition = 6,
  // Multi and single entries are stored in `StylingContext` as: Flag; PropertyName;  PropertyValue
  FlagsOffset = 0,
  PropertyOffset = 1,
  ValueOffset = 2,
  // Size of each multi or single entry (flag + prop + value)
  Size = 3,
  // Each flag has a binary digit length of this value
  BitCountSize = 14,  // (32 - 3) / 2 = ~14
  // The binary digit value as a mask
  BitMask = 0b11111111111111  // 14 bits
}

/**
 * Used clone a copy of a pre-computed template of a styling context.
 *
 * A pre-computed template is designed to be computed once for a given element
 * (instructions.ts has logic for caching this).
 */
export function allocStylingContext(
    lElement: LElementNode | null, templateStyleContext: StylingContext): StylingContext {
  // each instance gets a copy
  const context = templateStyleContext.slice() as any as StylingContext;
  context[StylingIndex.ElementPosition] = lElement;
  return context;
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
 *
 * @param initialClassDeclarations a list of class declarations and initial class values
 *    that are used later within the styling context.
 *
 *    -> ['foo', 'bar', SPECIAL_ENUM_VAL, 'foo', true]
 *       This implies that `foo` and `bar` will be later styled and that the `foo`
 *       class will be applied to the element as an initial class since it's true
 */
export function createStylingContextTemplate(
    initialClassDeclarations?: (string | boolean | InitialStylingFlags)[] | null,
    initialStyleDeclarations?: (string | boolean | InitialStylingFlags)[] | null,
    styleSanitizer?: StyleSanitizeFn | null): StylingContext {
  const initialStylingValues: InitialStyles = [null];
  const context: StylingContext = [null, styleSanitizer || null, initialStylingValues, 0, 0, null];

  // we use two maps since a class name might collide with a CSS style prop
  const stylesLookup: {[key: string]: number} = {};
  const classesLookup: {[key: string]: number} = {};

  let totalStyleDeclarations = 0;
  if (initialStyleDeclarations) {
    let hasPassedDeclarations = false;
    for (let i = 0; i < initialStyleDeclarations.length; i++) {
      const v = initialStyleDeclarations[i] as string | InitialStylingFlags;

      // this flag value marks where the declarations end the initial values begin
      if (v === InitialStylingFlags.VALUES_MODE) {
        hasPassedDeclarations = true;
      } else {
        const prop = v as string;
        if (hasPassedDeclarations) {
          const value = initialStyleDeclarations[++i] as string;
          initialStylingValues.push(value);
          stylesLookup[prop] = initialStylingValues.length - 1;
        } else {
          totalStyleDeclarations++;
          stylesLookup[prop] = 0;
        }
      }
    }
  }

  // make where the class offsets begin
  context[StylingIndex.ClassOffsetPosition] = totalStyleDeclarations;

  if (initialClassDeclarations) {
    let hasPassedDeclarations = false;
    for (let i = 0; i < initialClassDeclarations.length; i++) {
      const v = initialClassDeclarations[i] as string | boolean | InitialStylingFlags;
      // this flag value marks where the declarations end the initial values begin
      if (v === InitialStylingFlags.VALUES_MODE) {
        hasPassedDeclarations = true;
      } else {
        const className = v as string;
        if (hasPassedDeclarations) {
          const value = initialClassDeclarations[++i] as boolean;
          initialStylingValues.push(value);
          classesLookup[className] = initialStylingValues.length - 1;
        } else {
          classesLookup[className] = 0;
        }
      }
    }
  }

  const styleProps = Object.keys(stylesLookup);
  const classNames = Object.keys(classesLookup);
  const classNamesIndexStart = styleProps.length;
  const totalProps = styleProps.length + classNames.length;

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
  for (let i = 0; i < totalProps; i++) {
    const isClassBased = i >= classNamesIndexStart;
    const prop = isClassBased ? classNames[i - classNamesIndexStart] : styleProps[i];
    const indexForInitial = isClassBased ? classesLookup[prop] : stylesLookup[prop];
    const initialValue = initialStylingValues[indexForInitial];

    const indexForMulti = i * StylingIndex.Size + multiStart;
    const indexForSingle = i * StylingIndex.Size + singleStart;
    const initialFlag = prepareInitialFlag(prop, isClassBased, styleSanitizer || null);

    setFlag(context, indexForSingle, pointers(initialFlag, indexForInitial, indexForMulti));
    setProp(context, indexForSingle, prop);
    setValue(context, indexForSingle, null);

    const flagForMulti =
        initialFlag | (initialValue !== null ? StylingFlags.Dirty : StylingFlags.None);
    setFlag(context, indexForMulti, pointers(flagForMulti, indexForInitial, indexForSingle));
    setProp(context, indexForMulti, prop);
    setValue(context, indexForMulti, null);
  }

  // there is no initial value flag for the master index since it doesn't
  // reference an initial style value
  setFlag(context, StylingIndex.MasterFlagPosition, pointers(0, 0, multiStart));
  setContextDirty(context, initialStylingValues.length > 1);

  return context;
}

const EMPTY_ARR: any[] = [];
const EMPTY_OBJ: {[key: string]: any} = {};
/**
 * Sets and resolves all `multi` styling on an `StylingContext` so that they can be
 * applied to the element once `renderStyling` is called.
 *
 * All missing styles/class (any values that are not provided in the new `styles`
 * or `classes` params) will resolve to `null` within their respective positions
 * in the context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided style values.
 * @param classes The key/value map of CSS class names that will be used for the update.
 * @param styles The key/value map of CSS styles that will be used for the update.
 */
export function updateStylingMap(
    context: StylingContext, classes: {[key: string]: any} | string | null,
    styles?: {[key: string]: any} | null): void {
  let classNames: string[] = EMPTY_ARR;
  let applyAllClasses = false;
  let ignoreAllClassUpdates = false;

  // each time a string-based value pops up then it shouldn't require a deep
  // check of what's changed.
  if (typeof classes == 'string') {
    const cachedClassString = context[StylingIndex.CachedCssClassString] as string | null;
    if (cachedClassString && cachedClassString === classes) {
      ignoreAllClassUpdates = true;
    } else {
      context[StylingIndex.CachedCssClassString] = classes;
      classNames = classes.split(/\s+/);
      // this boolean is used to avoid having to create a key/value map of `true` values
      // since a classname string implies that all those classes are added
      applyAllClasses = true;
    }
  } else {
    classNames = classes ? Object.keys(classes) : EMPTY_ARR;
    context[StylingIndex.CachedCssClassString] = null;
  }

  classes = (classes || EMPTY_OBJ) as{[key: string]: any};

  const styleProps = styles ? Object.keys(styles) : EMPTY_ARR;
  styles = styles || EMPTY_OBJ;

  const classesStartIndex = styleProps.length;
  const multiStartIndex = getMultiStartIndex(context);

  let dirty = false;
  let ctxIndex = multiStartIndex;

  let propIndex = 0;
  const propLimit = styleProps.length + classNames.length;

  // the main loop here will try and figure out how the shape of the provided
  // styles differ with respect to the context. Later if the context/styles/classes
  // are off-balance then they will be dealt in another loop after this one
  while (ctxIndex < context.length && propIndex < propLimit) {
    const isClassBased = propIndex >= classesStartIndex;

    // when there is a cache-hit for a string-based class then we should
    // avoid doing any work diffing any of the changes
    if (!ignoreAllClassUpdates || !isClassBased) {
      const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
      const newProp: string =
          isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
      const newValue: string|boolean =
          isClassBased ? (applyAllClasses ? true : classes[newProp]) : styles[newProp];

      const prop = getProp(context, ctxIndex);
      if (prop === newProp) {
        const value = getValue(context, ctxIndex);
        const flag = getPointers(context, ctxIndex);
        if (hasValueChanged(flag, value, newValue)) {
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
          const valueToCompare = getValue(context, indexOfEntry);
          const flagToCompare = getPointers(context, indexOfEntry);
          swapMultiContextEntries(context, ctxIndex, indexOfEntry);
          if (valueToCompare !== newValue) {
            const initialValue = getInitialValue(context, flagToCompare);
            setValue(context, ctxIndex, newValue);
            if (initialValue !== newValue) {
              setDirty(context, ctxIndex, true);
              dirty = true;
            }
          }
        } else {
          // we only care to do this if the insertion is in the middle
          const newFlag = prepareInitialFlag(newProp, isClassBased, getStyleSanitizer(context));
          insertNewMultiProperty(context, ctxIndex, isClassBased, newProp, newFlag, newValue);
          dirty = true;
        }
      }
    }

    ctxIndex += StylingIndex.Size;
    propIndex++;
  }

  // this means that there are left-over values in the context that
  // were not included in the provided styles/classes and in this
  // case the  goal is to "remove" them from the context (by nullifying)
  while (ctxIndex < context.length) {
    const flag = getPointers(context, ctxIndex);
    const isClassBased = (flag & StylingFlags.Class) === StylingFlags.Class;
    if (ignoreAllClassUpdates && isClassBased) break;

    const value = getValue(context, ctxIndex);
    const doRemoveValue = valueExists(value, isClassBased);
    if (doRemoveValue) {
      setDirty(context, ctxIndex, true);
      setValue(context, ctxIndex, null);
      dirty = true;
    }
    ctxIndex += StylingIndex.Size;
  }

  // this means that there are left-over properties in the context that
  // were not detected in the context during the loop above. In that
  // case we want to add the new entries into the list
  const sanitizer = getStyleSanitizer(context);
  while (propIndex < propLimit) {
    const isClassBased = propIndex >= classesStartIndex;
    if (ignoreAllClassUpdates && isClassBased) break;

    const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
    const prop = isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
    const value: string|boolean =
        isClassBased ? (applyAllClasses ? true : classes[prop]) : styles[prop];
    const flag = prepareInitialFlag(prop, isClassBased, sanitizer) | StylingFlags.Dirty;
    context.push(flag, prop, value);
    propIndex++;
    dirty = true;
  }

  if (dirty) {
    setContextDirty(context, true);
  }
}

/**
 * Sets and resolves a single styling property/value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyling` is called.
 *
 * Note that prop-level styling values are considered higher priority than any styling that
 * has been applied using `updateStylingMap`, therefore, when styling values are rendered
 * then any styles/classes that have been applied using this function will be considered first
 * (then multi values second and then initial values as a backup).
 *
 * @param context The styling context that will be updated with the
 *    newly provided style value.
 * @param index The index of the property which is being updated.
 * @param value The CSS style value that will be assigned
 */
export function updateStyleProp(
    context: StylingContext, index: number, value: string | boolean | null): void {
  const singleIndex = StylingIndex.SingleStylesStartPosition + index * StylingIndex.Size;
  const currValue = getValue(context, singleIndex);
  const currFlag = getPointers(context, singleIndex);

  // didn't change ... nothing to make a note of
  if (hasValueChanged(currFlag, currValue, value)) {
    // the value will always get updated (even if the dirty flag is skipped)
    setValue(context, singleIndex, value);
    const indexForMulti = getMultiOrSingleIndex(currFlag);

    // if the value is the same in the multi-area then there's no point in re-assembling
    const valueForMulti = getValue(context, indexForMulti);
    if (!valueForMulti || valueForMulti !== value) {
      let multiDirty = false;
      let singleDirty = true;

      const isClassBased = (currFlag & StylingFlags.Class) === StylingFlags.Class;

      // only when the value is set to `null` should the multi-value get flagged
      if (!valueExists(value, isClassBased) && valueExists(valueForMulti, isClassBased)) {
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
 * This method will toggle the referenced CSS class (by the provided index)
 * within the given context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided class value.
 * @param index The index of the CSS class which is being updated.
 * @param addOrRemove Whether or not to add or remove the CSS class
 */
export function updateClassProp(
    context: StylingContext, index: number, addOrRemove: boolean): void {
  const adjustedIndex = index + context[StylingIndex.ClassOffsetPosition];
  updateStyleProp(context, adjustedIndex, addOrRemove);
}

/**
 * Renders all queued styling using a renderer onto the given element.
 *
 * This function works by rendering any styles (that have been applied
 * using `updateStylingMap`) and any classes (that have been applied using
 * `updateStyleProp`) onto the provided element using the provided renderer.
 * Just before the styles/classes are rendered a final key/value style map
 * will be assembled (if `styleStore` or `classStore` are provided).
 *
 * @param lElement the element that the styles will be rendered on
 * @param context The styling context that will be used to determine
 *      what styles will be rendered
 * @param renderer the renderer that will be used to apply the styling
 * @param styleStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param classStore if provided, the updated class values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 */
export function renderStyling(
    context: StylingContext, renderer: Renderer3, styleStore?: {[key: string]: any},
    classStore?: {[key: string]: boolean}) {
  if (isContextDirty(context)) {
    const native = context[StylingIndex.ElementPosition] !.native;
    const multiStartIndex = getMultiStartIndex(context);
    const styleSanitizer = getStyleSanitizer(context);
    for (let i = StylingIndex.SingleStylesStartPosition; i < context.length;
         i += StylingIndex.Size) {
      // there is no point in rendering styles that have not changed on screen
      if (isDirty(context, i)) {
        const prop = getProp(context, i);
        const value = getValue(context, i);
        const flag = getPointers(context, i);
        const isClassBased = flag & StylingFlags.Class ? true : false;
        const isInSingleRegion = i < multiStartIndex;

        let valueToApply: string|boolean|null = value;

        // VALUE DEFER CASE 1: Use a multi value instead of a null single value
        // this check implies that a single value was removed and we
        // should now defer to a multi value and use that (if set).
        if (isInSingleRegion && !valueExists(valueToApply, isClassBased)) {
          // single values ALWAYS have a reference to a multi index
          const multiIndex = getMultiOrSingleIndex(flag);
          valueToApply = getValue(context, multiIndex);
        }

        // VALUE DEFER CASE 2: Use the initial value if all else fails (is falsy)
        // the initial value will always be a string or null,
        // therefore we can safely adopt it incase there's nothing else
        // note that this should always be a falsy check since `false` is used
        // for both class and style comparisons (styles can't be false and false
        // classes are turned off and should therefore defer to their initial values)
        if (!valueExists(valueToApply, isClassBased)) {
          valueToApply = getInitialValue(context, flag);
        }

        if (isClassBased) {
          setClass(native, prop, valueToApply ? true : false, renderer, classStore);
        } else {
          const sanitizer = (flag & StylingFlags.Sanitize) ? styleSanitizer : null;
          setStyle(native, prop, valueToApply as string | null, renderer, sanitizer, styleStore);
        }
        setDirty(context, i, false);
      }
    }

    setContextDirty(context, false);
  }
}

/**
 * This function renders a given CSS prop/value entry using the
 * provided renderer. If a `store` value is provided then
 * that will be used a render context instead of the provided
 * renderer.
 *
 * @param native the DOM Element
 * @param prop the CSS style property that will be rendered
 * @param value the CSS style value that will be rendered
 * @param renderer
 * @param store an optional key/value map that will be used as a context to render styles on
 */
function setStyle(
    native: any, prop: string, value: string | null, renderer: Renderer3,
    sanitizer: StyleSanitizeFn | null, store?: {[key: string]: any}) {
  value = sanitizer && value ? sanitizer(prop, value) : value;
  if (store) {
    store[prop] = value;
  } else if (value) {
    ngDevMode && ngDevMode.rendererSetStyle++;
    isProceduralRenderer(renderer) ?
        renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
        native['style'].setProperty(prop, value);
  } else {
    ngDevMode && ngDevMode.rendererRemoveStyle++;
    isProceduralRenderer(renderer) ?
        renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
        native['style'].removeProperty(prop);
  }
}

/**
 * This function renders a given CSS class value using the provided
 * renderer (by adding or removing it from the provided element).
 * If a `store` value is provided then that will be used a render
 * context instead of the provided renderer.
 *
 * @param native the DOM Element
 * @param prop the CSS style property that will be rendered
 * @param value the CSS style value that will be rendered
 * @param renderer
 * @param store an optional key/value map that will be used as a context to render styles on
 */
function setClass(
    native: any, className: string, add: boolean, renderer: Renderer3,
    store?: {[key: string]: boolean}) {
  if (store) {
    store[className] = add;
  } else if (add) {
    ngDevMode && ngDevMode.rendererAddClass++;
    isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
                                     native['classList'].add(className);
  } else {
    ngDevMode && ngDevMode.rendererRemoveClass++;
    isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
                                     native['classList'].remove(className);
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

function isClassBased(context: StylingContext, index: number): boolean {
  const adjustedIndex =
      index >= StylingIndex.SingleStylesStartPosition ? (index + StylingIndex.FlagsOffset) : index;
  return ((context[adjustedIndex] as number) & StylingFlags.Class) == StylingFlags.Class;
}

function isSanitizable(context: StylingContext, index: number): boolean {
  const adjustedIndex =
      index >= StylingIndex.SingleStylesStartPosition ? (index + StylingIndex.FlagsOffset) : index;
  return ((context[adjustedIndex] as number) & StylingFlags.Sanitize) == StylingFlags.Sanitize;
}

function pointers(configFlag: number, staticIndex: number, dynamicIndex: number) {
  return (configFlag & StylingFlags.BitMask) | (staticIndex << StylingFlags.BitCountSize) |
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

function getStyleSanitizer(context: StylingContext): StyleSanitizeFn|null {
  return context[StylingIndex.StyleSanitizerPosition];
}

function setProp(context: StylingContext, index: number, prop: string) {
  context[index + StylingIndex.PropertyOffset] = prop;
}

function setValue(context: StylingContext, index: number, value: string | null | boolean) {
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

function getValue(context: StylingContext, index: number): string|boolean|null {
  return context[index + StylingIndex.ValueOffset] as string | boolean | null;
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
      const flagValue = (isDirty(context, singleIndex) ? StylingFlags.Dirty : StylingFlags.None) |
          (isClassBased(context, singleIndex) ? StylingFlags.Class : StylingFlags.None) |
          (isSanitizable(context, singleIndex) ? StylingFlags.Sanitize : StylingFlags.None);
      const updatedFlag = pointers(flagValue, initialIndexForSingle, i);
      setFlag(context, singleIndex, updatedFlag);
    }
  }
}

function insertNewMultiProperty(
    context: StylingContext, index: number, classBased: boolean, name: string, flag: number,
    value: string | boolean): void {
  const doShift = index < context.length;

  // prop does not exist in the list, add it in
  context.splice(
      index, 0, flag | StylingFlags.Dirty | (classBased ? StylingFlags.Class : StylingFlags.None),
      name, value);

  if (doShift) {
    // because the value was inserted midway into the array then we
    // need to update all the shifted multi values' single value
    // pointers to point to the newly shifted location
    updateSinglePointerValues(context, index + StylingIndex.Size);
  }
}

function valueExists(value: string | null | boolean, isClassBased?: boolean) {
  if (isClassBased) {
    return value ? true : false;
  }
  return value !== null;
}

function prepareInitialFlag(
    name: string, isClassBased: boolean, sanitizer?: StyleSanitizeFn | null) {
  if (isClassBased) {
    return StylingFlags.Class;
  } else if (sanitizer && sanitizer(name)) {
    return StylingFlags.Sanitize;
  }
  return StylingFlags.None;
}

function hasValueChanged(
    flag: number, a: string | boolean | null, b: string | boolean | null): boolean {
  const isClassBased = flag & StylingFlags.Class;
  const hasValues = a && b;
  const usesSanitizer = flag & StylingFlags.Sanitize;
  // the toString() comparison ensures that a value is checked
  // ... otherwise (during sanitization bypassing) the === comparsion
  // would fail since a new String() instance is created
  if (!isClassBased && hasValues && usesSanitizer) {
    // we know for sure we're dealing with strings at this point
    return (a as string).toString() !== (b as string).toString();
  }

  // everything else is safe to check with a normal equality check
  return a !== b;
}
