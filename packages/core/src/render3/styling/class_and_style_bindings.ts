/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {EMPTY_ARRAY, EMPTY_OBJ} from '../empty';
import {AttributeMarker, TAttributes} from '../interfaces/node';
import {BindingStore, BindingType, Player, PlayerBuilder, PlayerFactory, PlayerIndex} from '../interfaces/player';
import {RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {DirectiveOwnerAndPlayerBuilderIndex, DirectiveRegistryValues, DirectiveRegistryValuesIndex, InitialStylingValues, InitialStylingValuesIndex, MapBasedOffsetValues, MapBasedOffsetValuesIndex, SinglePropOffsetValues, SinglePropOffsetValuesIndex, StylingContext, StylingFlags, StylingIndex} from '../interfaces/styling';
import {LView, RootContext} from '../interfaces/view';
import {NO_CHANGE} from '../tokens';
import {getRootContext} from '../util';

import {BoundPlayerFactory} from './player_factory';
import {addPlayerInternal, allocPlayerContext, allocateDirectiveIntoContext, createEmptyStylingContext, getPlayerContext} from './util';



/**
 * This file includes the code to power all styling-binding operations in Angular.
 *
 * These include:
 * [style]="myStyleObj"
 * [class]="myClassObj"
 * [style.prop]="myPropValue"
 * [class.name]="myClassValue"
 *
 * It also includes code that will allow style binding code to operate within host
 * bindings for components/directives.
 *
 * There are many different ways in which these functions below are called. Please see
 * `render3/interfaces/styling.ts` to get a better idea of how the styling algorithm works.
 */



/**
 * Creates a new StylingContext an fills it with the provided static styling attribute values.
 */
export function initializeStaticContext(attrs: TAttributes): StylingContext {
  const context = createEmptyStylingContext();
  const initialClasses: InitialStylingValues = context[StylingIndex.InitialClassValuesPosition] =
      [null, null];
  const initialStyles: InitialStylingValues = context[StylingIndex.InitialStyleValuesPosition] =
      [null, null];

  // The attributes array has marker values (numbers) indicating what the subsequent
  // values represent. When we encounter a number, we set the mode to that type of attribute.
  let mode = -1;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (typeof attr == 'number') {
      mode = attr;
    } else if (mode === AttributeMarker.Styles) {
      initialStyles.push(attr as string, attrs[++i] as string);
    } else if (mode === AttributeMarker.Classes) {
      initialClasses.push(attr as string, true);
    } else if (mode === AttributeMarker.SelectOnly) {
      break;
    }
  }

  return context;
}

/**
 * Designed to update an existing styling context with new static styling
 * data (classes and styles).
 *
 * @param context the existing styling context
 * @param attrs an array of new static styling attributes that will be
 *              assigned to the context
 * @param directiveRef the directive instance with which static data is associated with.
 */
export function patchContextWithStaticAttrs(
    context: StylingContext, attrs: TAttributes, startingIndex: number, directiveRef: any): void {
  // If the styling context has already been patched with the given directive's bindings,
  // then there is no point in doing it again. The reason why this may happen (the directive
  // styling being patched twice) is because the `stylingBinding` function is called each time
  // an element is created (both within a template function and within directive host bindings).
  const directives = context[StylingIndex.DirectiveRegistryPosition];
  if (getDirectiveRegistryValuesIndexOf(directives, directiveRef) == -1) {
    // this is a new directive which we have not seen yet.
    allocateDirectiveIntoContext(context, directiveRef);

    let initialClasses: InitialStylingValues|null = null;
    let initialStyles: InitialStylingValues|null = null;

    let mode = -1;
    for (let i = startingIndex; i < attrs.length; i++) {
      const attr = attrs[i];
      if (typeof attr == 'number') {
        mode = attr;
      } else if (mode == AttributeMarker.Classes) {
        initialClasses = initialClasses || context[StylingIndex.InitialClassValuesPosition];
        patchInitialStylingValue(initialClasses, attr, true);
      } else if (mode == AttributeMarker.Styles) {
        initialStyles = initialStyles || context[StylingIndex.InitialStyleValuesPosition];
        patchInitialStylingValue(initialStyles, attr, attrs[++i]);
      }
    }
  }
}

/**
 * Designed to add a style or class value into the existing set of initial styles.
 *
 * The function will search and figure out if a style/class value is already present
 * within the provided initial styling array. If and when a style/class value is not
 * present (or if it's value is falsy) then it will be inserted/updated in the list
 * of initial styling values.
 */
function patchInitialStylingValue(
    initialStyling: InitialStylingValues, prop: string, value: any): void {
  // Even values are keys; Odd numbers are values; Search keys only
  for (let i = InitialStylingValuesIndex.KeyValueStartPosition; i < initialStyling.length;) {
    const key = initialStyling[i];
    if (key === prop) {
      const existingValue = initialStyling[i + InitialStylingValuesIndex.ValueOffset];

      // If there is no previous style value (when `null`) or no previous class
      // applied (when `false`) then we update the the newly given value.
      if (existingValue == null || existingValue == false) {
        initialStyling[i + InitialStylingValuesIndex.ValueOffset] = value;
      }
      return;
    }
    i = i + InitialStylingValuesIndex.Size;
  }
  // We did not find existing key, add a new one.
  initialStyling.push(prop, value);
}

/**
 * Runs through the initial style data present in the context and renders
 * them via the renderer on the element.
 */
export function renderInitialStyles(
    element: RElement, context: StylingContext, renderer: Renderer3) {
  const initialStyles = context[StylingIndex.InitialStyleValuesPosition];
  renderInitialStylingValues(element, renderer, initialStyles, false);
}

/**
 * Runs through the initial class data present in the context and renders
 * them via the renderer on the element.
 */
export function renderInitialClasses(
    element: RElement, context: StylingContext, renderer: Renderer3) {
  const initialClasses = context[StylingIndex.InitialClassValuesPosition];
  renderInitialStylingValues(element, renderer, initialClasses, true);
}

/**
 * This is a helper function designed to render each entry present within the
 * provided list of initialStylingValues.
 */
function renderInitialStylingValues(
    element: RElement, renderer: Renderer3, initialStylingValues: InitialStylingValues,
    isEntryClassBased: boolean) {
  for (let i = InitialStylingValuesIndex.KeyValueStartPosition; i < initialStylingValues.length;
       i += InitialStylingValuesIndex.Size) {
    const value = initialStylingValues[i + InitialStylingValuesIndex.ValueOffset];
    if (value) {
      if (isEntryClassBased) {
        setClass(
            element, initialStylingValues[i + InitialStylingValuesIndex.PropOffset] as string, true,
            renderer, null);
      } else {
        setStyle(
            element, initialStylingValues[i + InitialStylingValuesIndex.PropOffset] as string,
            value as string, renderer, null);
      }
    }
  }
}

export function allowNewBindingsForStylingContext(context: StylingContext): boolean {
  return (context[StylingIndex.MasterFlagPosition] & StylingFlags.BindingAllocationLocked) === 0;
}

/**
 * Adds in new binding values to a styling context.
 *
 * If a directive value is provided then all provided class/style binding names will
 * reference the provided directive.
 *
 * @param context the existing styling context
 * @param directiveRef the directive that the new bindings will reference
 * @param classBindingNames an array of class binding names that will be added to the context
 * @param styleBindingNames an array of style binding names that will be added to the context
 * @param styleSanitizer an optional sanitizer that handle all sanitization on for each of
 *    the bindings added to the context. Note that if a directive is provided then the sanitizer
 *    instance will only be active if and when the directive updates the bindings that it owns.
 */
export function updateContextWithBindings(
    context: StylingContext, directiveRef: any | null, classBindingNames?: string[] | null,
    styleBindingNames?: string[] | null, styleSanitizer?: StyleSanitizeFn | null) {
  if (context[StylingIndex.MasterFlagPosition] & StylingFlags.BindingAllocationLocked) return;

  // this means the context has already been patched with the directive's bindings
  const directiveIndex = findOrPatchDirectiveIntoRegistry(context, directiveRef, styleSanitizer);
  if (directiveIndex === -1) {
    // this means the directive has already been patched in ... No point in doing anything
    return;
  }

  if (styleBindingNames) {
    styleBindingNames = hyphenateEntries(styleBindingNames);
  }

  // there are alot of variables being used below to track where in the context the new
  // binding values will be placed. Because the context consists of multiple types of
  // entries (single classes/styles and multi classes/styles) alot of the index positions
  // need to be computed ahead of time and the context needs to be extended before the values
  // are inserted in.
  const singlePropOffsetValues = context[StylingIndex.SinglePropOffsetPositions];
  const totalCurrentClassBindings =
      singlePropOffsetValues[SinglePropOffsetValuesIndex.ClassesCountPosition];
  const totalCurrentStyleBindings =
      singlePropOffsetValues[SinglePropOffsetValuesIndex.StylesCountPosition];

  const cachedClassMapValues = context[StylingIndex.CachedMultiClasses];
  const cachedStyleMapValues = context[StylingIndex.CachedMultiStyles];

  const classesOffset = totalCurrentClassBindings * StylingIndex.Size;
  const stylesOffset = totalCurrentStyleBindings * StylingIndex.Size;

  const singleStylesStartIndex = StylingIndex.SingleStylesStartPosition;
  let singleClassesStartIndex = singleStylesStartIndex + stylesOffset;
  let multiStylesStartIndex = singleClassesStartIndex + classesOffset;
  let multiClassesStartIndex = multiStylesStartIndex + stylesOffset;

  // because we're inserting more bindings into the context, this means that the
  // binding values need to be referenced the singlePropOffsetValues array so that
  // the template/directive can easily find them inside of the `elementStyleProp`
  // and the `elementClassProp` functions without iterating through the entire context.
  // The first step to setting up these reference points is to mark how many bindings
  // are being added. Even if these bindings already exist in the context, the directive
  // or template code will still call them unknowingly. Therefore the total values need
  // to be registered so that we know how many bindings are assigned to each directive.
  const currentSinglePropsLength = singlePropOffsetValues.length;
  singlePropOffsetValues.push(
      styleBindingNames ? styleBindingNames.length : 0,
      classBindingNames ? classBindingNames.length : 0);

  // the code below will check to see if a new style binding already exists in the context
  // if so then there is no point in inserting it into the context again. Whether or not it
  // exists the styling offset code will now know exactly where it is
  let insertionOffset = 0;
  const filteredStyleBindingNames: string[] = [];
  if (styleBindingNames && styleBindingNames.length) {
    for (let i = 0; i < styleBindingNames.length; i++) {
      const name = styleBindingNames[i];
      let singlePropIndex =
          getMatchingBindingIndex(context, name, singleStylesStartIndex, singleClassesStartIndex);
      if (singlePropIndex == -1) {
        singlePropIndex = singleClassesStartIndex + insertionOffset;
        insertionOffset += StylingIndex.Size;
        filteredStyleBindingNames.push(name);
      }
      singlePropOffsetValues.push(singlePropIndex);
    }
  }

  // just like with the style binding loop above, the new class bindings get the same treatment...
  const filteredClassBindingNames: string[] = [];
  if (classBindingNames && classBindingNames.length) {
    for (let i = 0; i < classBindingNames.length; i++) {
      const name = classBindingNames[i];
      let singlePropIndex =
          getMatchingBindingIndex(context, name, singleClassesStartIndex, multiStylesStartIndex);
      if (singlePropIndex == -1) {
        singlePropIndex = multiStylesStartIndex + insertionOffset;
        insertionOffset += StylingIndex.Size;
        filteredClassBindingNames.push(name);
      } else {
        singlePropIndex += filteredStyleBindingNames.length * StylingIndex.Size;
      }
      singlePropOffsetValues.push(singlePropIndex);
    }
  }

  // because new styles are being inserted, this means the existing collection of style offset
  // index values are incorrect (they point to the wrong values). The code below will run through
  // the entire offset array and update the existing set of index values to point to their new
  // locations while taking the new binding values into consideration.
  let i = SinglePropOffsetValuesIndex.ValueStartPosition;
  if (filteredStyleBindingNames.length) {
    while (i < currentSinglePropsLength) {
      const totalStyles =
          singlePropOffsetValues[i + SinglePropOffsetValuesIndex.StylesCountPosition];
      const totalClasses =
          singlePropOffsetValues[i + SinglePropOffsetValuesIndex.ClassesCountPosition];
      if (totalClasses) {
        const start = i + SinglePropOffsetValuesIndex.ValueStartPosition + totalStyles;
        for (let j = start; j < start + totalClasses; j++) {
          singlePropOffsetValues[j] += filteredStyleBindingNames.length * StylingIndex.Size;
        }
      }

      const total = totalStyles + totalClasses;
      i += SinglePropOffsetValuesIndex.ValueStartPosition + total;
    }
  }

  const totalNewEntries = filteredClassBindingNames.length + filteredStyleBindingNames.length;

  // in the event that there are new style values being inserted, all existing class and style
  // bindings need to have their pointer values offsetted with the new amount of space that is
  // used for the new style/class bindings.
  for (let i = singleStylesStartIndex; i < context.length; i += StylingIndex.Size) {
    const isMultiBased = i >= multiStylesStartIndex;
    const isClassBased = i >= (isMultiBased ? multiClassesStartIndex : singleClassesStartIndex);
    const flag = getPointers(context, i);
    const staticIndex = getInitialIndex(flag);
    let singleOrMultiIndex = getMultiOrSingleIndex(flag);
    if (isMultiBased) {
      singleOrMultiIndex +=
          isClassBased ? (filteredStyleBindingNames.length * StylingIndex.Size) : 0;
    } else {
      singleOrMultiIndex += (totalNewEntries * StylingIndex.Size) +
          ((isClassBased ? filteredStyleBindingNames.length : 0) * StylingIndex.Size);
    }
    setFlag(context, i, pointers(flag, staticIndex, singleOrMultiIndex));
  }

  // this is where we make space in the context for the new style bindings
  for (let i = 0; i < filteredStyleBindingNames.length * StylingIndex.Size; i++) {
    context.splice(multiClassesStartIndex, 0, null);
    context.splice(singleClassesStartIndex, 0, null);
    singleClassesStartIndex++;
    multiStylesStartIndex++;
    multiClassesStartIndex += 2;  // both single + multi slots were inserted
  }

  // this is where we make space in the context for the new class bindings
  for (let i = 0; i < filteredClassBindingNames.length * StylingIndex.Size; i++) {
    context.splice(multiStylesStartIndex, 0, null);
    context.push(null);
    multiStylesStartIndex++;
    multiClassesStartIndex++;
  }

  const initialClasses = context[StylingIndex.InitialClassValuesPosition];
  const initialStyles = context[StylingIndex.InitialStyleValuesPosition];

  // the code below will insert each new entry into the context and assign the appropriate
  // flags and index values to them. It's important this runs at the end of this function
  // because the context, property offset and index values have all been computed just before.
  for (let i = 0; i < totalNewEntries; i++) {
    const entryIsClassBased = i >= filteredStyleBindingNames.length;
    const adjustedIndex = entryIsClassBased ? (i - filteredStyleBindingNames.length) : i;
    const propName = entryIsClassBased ? filteredClassBindingNames[adjustedIndex] :
                                         filteredStyleBindingNames[adjustedIndex];

    let multiIndex, singleIndex;
    if (entryIsClassBased) {
      multiIndex = multiClassesStartIndex +
          ((totalCurrentClassBindings + adjustedIndex) * StylingIndex.Size);
      singleIndex = singleClassesStartIndex +
          ((totalCurrentClassBindings + adjustedIndex) * StylingIndex.Size);
    } else {
      multiIndex =
          multiStylesStartIndex + ((totalCurrentStyleBindings + adjustedIndex) * StylingIndex.Size);
      singleIndex = singleStylesStartIndex +
          ((totalCurrentStyleBindings + adjustedIndex) * StylingIndex.Size);
    }

    // if a property is not found in the initial style values list then it
    // is ALWAYS added incase a follow-up directive introduces the same initial
    // style/class value later on.
    let initialValuesToLookup = entryIsClassBased ? initialClasses : initialStyles;
    let indexForInitial = getInitialStylingValuesIndexOf(initialValuesToLookup, propName);
    if (indexForInitial === -1) {
      indexForInitial = initialValuesToLookup.length + InitialStylingValuesIndex.ValueOffset;
      initialValuesToLookup.push(propName, entryIsClassBased ? false : null);
    } else {
      indexForInitial += InitialStylingValuesIndex.ValueOffset;
    }

    const initialFlag =
        prepareInitialFlag(context, propName, entryIsClassBased, styleSanitizer || null);

    setFlag(context, singleIndex, pointers(initialFlag, indexForInitial, multiIndex));
    setProp(context, singleIndex, propName);
    setValue(context, singleIndex, null);
    setPlayerBuilderIndex(context, singleIndex, 0, directiveIndex);

    setFlag(context, multiIndex, pointers(initialFlag, indexForInitial, singleIndex));
    setProp(context, multiIndex, propName);
    setValue(context, multiIndex, null);
    setPlayerBuilderIndex(context, multiIndex, 0, directiveIndex);
  }

  // the total classes/style values are updated so the next time the context is patched
  // additional style/class bindings from another directive then it knows exactly where
  // to insert them in the context
  singlePropOffsetValues[SinglePropOffsetValuesIndex.ClassesCountPosition] =
      totalCurrentClassBindings + filteredClassBindingNames.length;
  singlePropOffsetValues[SinglePropOffsetValuesIndex.StylesCountPosition] =
      totalCurrentStyleBindings + filteredStyleBindingNames.length;

  // the map-based values also need to know how many entries got inserted
  cachedClassMapValues[MapBasedOffsetValuesIndex.EntriesCountPosition] +=
      filteredClassBindingNames.length;
  cachedStyleMapValues[MapBasedOffsetValuesIndex.EntriesCountPosition] +=
      filteredStyleBindingNames.length;
  const newStylesSpaceAllocationSize = filteredStyleBindingNames.length * StylingIndex.Size;
  const newClassesSpaceAllocationSize = filteredClassBindingNames.length * StylingIndex.Size;

  // update the multi styles cache with a reference for the directive that was just inserted
  const directiveMultiStylesStartIndex =
      multiStylesStartIndex + totalCurrentStyleBindings * StylingIndex.Size;
  const cachedStyleMapIndex = cachedStyleMapValues.length;
  registerMultiMapEntry(
      context, directiveIndex, false, directiveMultiStylesStartIndex,
      filteredStyleBindingNames.length);

  for (let i = MapBasedOffsetValuesIndex.ValuesStartPosition; i < cachedStyleMapIndex;
       i += MapBasedOffsetValuesIndex.Size) {
    // multi values start after all the single values (which is also where classes are) in the
    // context therefore the new class allocation size should be taken into account
    cachedStyleMapValues[i + MapBasedOffsetValuesIndex.PositionStartOffset] +=
        newClassesSpaceAllocationSize + newStylesSpaceAllocationSize;
  }

  // update the multi classes cache with a reference for the directive that was just inserted
  const directiveMultiClassesStartIndex =
      multiClassesStartIndex + totalCurrentClassBindings * StylingIndex.Size;
  const cachedClassMapIndex = cachedClassMapValues.length;
  registerMultiMapEntry(
      context, directiveIndex, true, directiveMultiClassesStartIndex,
      filteredClassBindingNames.length);

  for (let i = MapBasedOffsetValuesIndex.ValuesStartPosition; i < cachedClassMapIndex;
       i += MapBasedOffsetValuesIndex.Size) {
    // the reason why both the styles + classes space is allocated to the existing offsets is
    // because the styles show up before the classes in the context and any new inserted
    // styles will offset any existing class entries in the context (even if there are no
    // new class entries added) also the reason why it's *2 is because both single + multi
    // entries for each new style have been added in the context before the multi class values
    // actually start
    cachedClassMapValues[i + MapBasedOffsetValuesIndex.PositionStartOffset] +=
        (newStylesSpaceAllocationSize * 2) + newClassesSpaceAllocationSize;
  }

  // there is no initial value flag for the master index since it doesn't
  // reference an initial style value
  const masterFlag = pointers(0, 0, multiStylesStartIndex);
  setFlag(context, StylingIndex.MasterFlagPosition, masterFlag);
}

/**
 * Searches through the existing registry of directives
 */
export function findOrPatchDirectiveIntoRegistry(
    context: StylingContext, directiveRef: any, styleSanitizer?: StyleSanitizeFn | null) {
  const directiveRefs = context[StylingIndex.DirectiveRegistryPosition];
  const nextOffsetInsertionIndex = context[StylingIndex.SinglePropOffsetPositions].length;

  let directiveIndex: number;
  let detectedIndex = getDirectiveRegistryValuesIndexOf(directiveRefs, directiveRef);

  if (detectedIndex === -1) {
    detectedIndex = directiveRefs.length;
    directiveIndex = directiveRefs.length / DirectiveRegistryValuesIndex.Size;

    allocateDirectiveIntoContext(context, directiveRef);
    directiveRefs[detectedIndex + DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset] =
        nextOffsetInsertionIndex;
    directiveRefs[detectedIndex + DirectiveRegistryValuesIndex.StyleSanitizerOffset] =
        styleSanitizer || null;
  } else {
    const singlePropStartPosition =
        detectedIndex + DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset;
    if (directiveRefs[singlePropStartPosition] ! >= 0) {
      // the directive has already been patched into the context
      return -1;
    }

    directiveIndex = detectedIndex / DirectiveRegistryValuesIndex.Size;

    // because the directive already existed this means that it was set during elementHostAttrs or
    // elementStart which means that the binding values were not here. Therefore, the values below
    // need to be applied so that single class and style properties can be assigned later.
    const singlePropPositionIndex =
        detectedIndex + DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset;
    directiveRefs[singlePropPositionIndex] = nextOffsetInsertionIndex;

    // the sanitizer is also apart of the binding process and will be used when bindings are
    // applied.
    const styleSanitizerIndex = detectedIndex + DirectiveRegistryValuesIndex.StyleSanitizerOffset;
    directiveRefs[styleSanitizerIndex] = styleSanitizer || null;
  }

  return directiveIndex;
}

function getMatchingBindingIndex(
    context: StylingContext, bindingName: string, start: number, end: number) {
  for (let j = start; j < end; j += StylingIndex.Size) {
    if (getProp(context, j) === bindingName) return j;
  }
  return -1;
}

/**
 * Registers the provided multi styling (`[style]` and `[class]`) values to the context.
 *
 * This function will iterate over the provided `classesInput` and `stylesInput` map
 * values and insert/update or remove them from the context at exactly the right
 * spot.
 *
 * This function also takes in a directive which implies that the styling values will
 * be evaluated for that directive with respect to any other styling that already exists
 * on the context. When there are styles that conflict (e.g. say `ngStyle` and `[style]`
 * both update the `width` property at the same time) then the styling algorithm code below
 * will decide which one wins based on the directive styling prioritization mechanism. This
 * mechanism is better explained in render3/interfaces/styling.ts#directives).
 *
 * This function will not render any styling values on screen, but is rather designed to
 * prepare the context for that. `renderStyling` must be called afterwards to render any
 * styling data that was set in this function (note that `updateClassProp` and
 * `updateStyleProp` are designed to be run after this function is run).
 *
 * @param context The styling context that will be updated with the
 *    newly provided style values.
 * @param classesInput The key/value map of CSS class names that will be used for the update.
 * @param stylesInput The key/value map of CSS styles that will be used for the update.
 * @param directiveRef an optional reference to the directive responsible
 *    for this binding change. If present then style binding will only
 *    actualize if the directive has ownership over this binding
 *    (see styling.ts#directives for more information about the algorithm).
 */
export function updateStylingMap(
    context: StylingContext, classesInput: {[key: string]: any} | string |
        BoundPlayerFactory<null|string|{[key: string]: any}>| null,
    stylesInput?: {[key: string]: any} | BoundPlayerFactory<null|{[key: string]: any}>| null,
    directiveRef?: any): void {
  const directiveIndex = getDirectiveIndexFromRegistry(context, directiveRef || null);

  classesInput = classesInput || null;
  stylesInput = stylesInput || null;
  const ignoreAllClassUpdates = isMultiValueCacheHit(context, true, directiveIndex, classesInput);
  const ignoreAllStyleUpdates = isMultiValueCacheHit(context, false, directiveIndex, stylesInput);

  // early exit (this is what's done to avoid using ctx.bind() to cache the value)
  if (ignoreAllClassUpdates && ignoreAllStyleUpdates) return;

  classesInput =
      classesInput === NO_CHANGE ? readCachedMapValue(context, true, directiveIndex) : classesInput;
  stylesInput =
      stylesInput === NO_CHANGE ? readCachedMapValue(context, false, directiveIndex) : stylesInput;

  const element = context[StylingIndex.ElementPosition] !as HTMLElement;
  const classesPlayerBuilder = classesInput instanceof BoundPlayerFactory ?
      new ClassAndStylePlayerBuilder(classesInput as any, element, BindingType.Class) :
      null;
  const stylesPlayerBuilder = stylesInput instanceof BoundPlayerFactory ?
      new ClassAndStylePlayerBuilder(stylesInput as any, element, BindingType.Style) :
      null;

  const classesValue = classesPlayerBuilder ?
      (classesInput as BoundPlayerFactory<{[key: string]: any}|string>) !.value :
      classesInput;
  const stylesValue = stylesPlayerBuilder ? stylesInput !.value : stylesInput;

  let classNames: string[] = EMPTY_ARRAY;
  let applyAllClasses = false;
  let playerBuildersAreDirty = false;

  const classesPlayerBuilderIndex =
      classesPlayerBuilder ? PlayerIndex.ClassMapPlayerBuilderPosition : 0;
  if (hasPlayerBuilderChanged(
          context, classesPlayerBuilder, PlayerIndex.ClassMapPlayerBuilderPosition)) {
    setPlayerBuilder(context, classesPlayerBuilder, PlayerIndex.ClassMapPlayerBuilderPosition);
    playerBuildersAreDirty = true;
  }

  const stylesPlayerBuilderIndex =
      stylesPlayerBuilder ? PlayerIndex.StyleMapPlayerBuilderPosition : 0;
  if (hasPlayerBuilderChanged(
          context, stylesPlayerBuilder, PlayerIndex.StyleMapPlayerBuilderPosition)) {
    setPlayerBuilder(context, stylesPlayerBuilder, PlayerIndex.StyleMapPlayerBuilderPosition);
    playerBuildersAreDirty = true;
  }

  // each time a string-based value pops up then it shouldn't require a deep
  // check of what's changed.
  if (!ignoreAllClassUpdates) {
    if (typeof classesValue == 'string') {
      classNames = classesValue.split(/\s+/);
      // this boolean is used to avoid having to create a key/value map of `true` values
      // since a classname string implies that all those classes are added
      applyAllClasses = true;
    } else {
      classNames = classesValue ? Object.keys(classesValue) : EMPTY_ARRAY;
    }
  }

  const multiStylesStartIndex = getMultiStylesStartIndex(context);
  let multiClassesStartIndex = getMultiClassesStartIndex(context);
  let multiClassesEndIndex = context.length;

  if (!ignoreAllStyleUpdates) {
    const styleProps = stylesValue ? Object.keys(stylesValue) : EMPTY_ARRAY;
    const styles = stylesValue || EMPTY_OBJ;
    const totalNewEntries = patchStylingMapIntoContext(
        context, directiveIndex, stylesPlayerBuilderIndex, multiStylesStartIndex,
        multiClassesStartIndex, styleProps, styles, stylesInput, false);
    if (totalNewEntries) {
      multiClassesStartIndex += totalNewEntries * StylingIndex.Size;
      multiClassesEndIndex += totalNewEntries * StylingIndex.Size;
    }
  }

  if (!ignoreAllClassUpdates) {
    const classes = (classesValue || EMPTY_OBJ) as{[key: string]: any};
    patchStylingMapIntoContext(
        context, directiveIndex, classesPlayerBuilderIndex, multiClassesStartIndex,
        multiClassesEndIndex, classNames, applyAllClasses || classes, classesInput, true);
  }

  if (playerBuildersAreDirty) {
    setContextPlayersDirty(context, true);
  }
}

/**
 * Applies the given multi styling (styles or classes) values to the context.
 *
 * The styling algorithm code that applies multi-level styling (things like `[style]` and `[class]`
 * values) resides here.
 *
 * Because this function understands that multiple directives may all write to the `[style]` and
 * `[class]` bindings (through host bindings), it relies of each directive applying its binding
 * value in order. This means that a directive like `classADirective` will always fire before
 * `classBDirective` and therefore its styling values (classes and styles) will always be evaluated
 * in the same order. Because of this consistent ordering, the first directive has a higher priority
 * than the second one. It is with this prioritzation mechanism that the styling algorithm knows how
 * to merge and apply redudant styling properties.
 *
 * The function itself applies the key/value entries (or an array of keys) to
 * the context in the following steps.
 *
 * STEP 1:
 *    First check to see what properties are already set and in use by another directive in the
 *    context (e.g. `ngClass` set the `width` value and `[style.width]="w"` in a directive is
 *    attempting to set it as well).
 *
 * STEP 2:
 *    All remaining properties (that were not set prior to this directive) are now updated in
 *    the context. Any new properties are inserted exactly at their spot in the context and any
 *    previously set properties are shifted to exactly where the cursor sits while iterating over
 *    the context. The end result is a balanced context that includes the exact ordering of the
 *    styling properties/values for the provided input from the directive.
 *
 * STEP 3:
 *    Any unmatched properties in the context that belong to the directive are set to null
 *
 * Once the updating phase is done, then the algorithm will decide whether or not to flag the
 * follow-up directives (the directives that will pass in their styling values) depending on if
 * the "shape" of the multi-value map has changed (either if any keys are removed or added or
 * if there are any new `null` values). If any follow-up directives are flagged as dirty then the
 * algorithm will run again for them. Otherwise if the shape did not change then any follow-up
 * directives will not run (so long as their binding values stay the same).
 *
 * @returns the total amount of new slots that were allocated into the context due to new styling
 *          properties that were detected.
 */
function patchStylingMapIntoContext(
    context: StylingContext, directiveIndex: number, playerBuilderIndex: number, ctxStart: number,
    ctxEnd: number, props: (string | null)[], values: {[key: string]: any} | true, cacheValue: any,
    entryIsClassBased: boolean): number {
  let dirty = false;

  const cacheIndex = MapBasedOffsetValuesIndex.ValuesStartPosition +
      directiveIndex * MapBasedOffsetValuesIndex.Size;

  // the cachedValues array is the registry of all multi style values (map values). Each
  // value is stored (cached) each time is updated.
  const cachedValues =
      context[entryIsClassBased ? StylingIndex.CachedMultiClasses : StylingIndex.CachedMultiStyles];

  // this is the index in which this directive has ownership access to write to this
  // value (anything before is owned by a previous directive that is more important)
  const ownershipValuesStartIndex =
      cachedValues[cacheIndex + MapBasedOffsetValuesIndex.PositionStartOffset];

  const existingCachedValue = cachedValues[cacheIndex + MapBasedOffsetValuesIndex.ValueOffset];
  const existingCachedValueCount =
      cachedValues[cacheIndex + MapBasedOffsetValuesIndex.ValueCountOffset];
  const existingCachedValueIsDirty =
      cachedValues[cacheIndex + MapBasedOffsetValuesIndex.DirtyFlagOffset] === 1;

  // A shape change means the provided map value has either removed or added new properties
  // compared to what were in the last time. If a shape change occurs then it means that all
  // follow-up multi-styling entries are obsolete and will be examined again when CD runs
  // them. If a shape change has not occurred then there is no reason to check any other
  // directive values if their identity has not changed. If a previous directive set this
  // value as dirty (because its own shape changed) then this means that the object has been
  // offset to a different area in the context. Because its value has been offset then it
  // can't write to a region that it wrote to before (which may have been apart of another
  // directive) and therefore its shape changes too.
  let valuesEntryShapeChange =
      existingCachedValueIsDirty || ((!existingCachedValue && cacheValue) ? true : false);

  let totalUniqueValues = 0;
  let totalNewAllocatedSlots = 0;

  // this is a trick to avoid building {key:value} map where all the values
  // are `true` (this happens when a className string is provided instead of a
  // map as an input value to this styling algorithm)
  const applyAllProps = values === true;

  // STEP 1:
  // loop through the earlier directives and figure out if any properties here will be placed
  // in their area (this happens when the value is null because the earlier directive erased it).
  let ctxIndex = ctxStart;
  let totalRemainingProperties = props.length;
  while (ctxIndex < ownershipValuesStartIndex) {
    const currentProp = getProp(context, ctxIndex);
    if (totalRemainingProperties) {
      for (let i = 0; i < props.length; i++) {
        const mapProp = props[i];
        const normalizedProp = mapProp ? (entryIsClassBased ? mapProp : hyphenate(mapProp)) : null;
        if (normalizedProp && currentProp === normalizedProp) {
          const currentValue = getValue(context, ctxIndex);
          const currentDirectiveIndex = getDirectiveIndexFromEntry(context, ctxIndex);
          const value = applyAllProps ? true : (values as{[key: string]: any})[normalizedProp];
          const currentFlag = getPointers(context, ctxIndex);
          if (hasValueChanged(currentFlag, currentValue, value) &&
              allowValueChange(currentValue, value, currentDirectiveIndex, directiveIndex)) {
            setValue(context, ctxIndex, value);
            setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex, directiveIndex);
            if (hasInitialValueChanged(context, currentFlag, value)) {
              setDirty(context, ctxIndex, true);
              dirty = true;
            }
          }
          props[i] = null;
          totalRemainingProperties--;
          break;
        }
      }
    }
    ctxIndex += StylingIndex.Size;
  }

  // STEP 2:
  // apply the left over properties to the context in the correct order.
  if (totalRemainingProperties) {
    const sanitizer = entryIsClassBased ? null : getStyleSanitizer(context, directiveIndex);
    propertiesLoop: for (let i = 0; i < props.length; i++) {
      const mapProp = props[i];

      if (!mapProp) {
        // this is an early exit incase a value was already encountered above in the
        // previous loop (which means that the property was applied or rejected)
        continue;
      }

      const value = applyAllProps ? true : (values as{[key: string]: any})[mapProp];
      const normalizedProp = entryIsClassBased ? mapProp : hyphenate(mapProp);
      const isInsideOwnershipArea = ctxIndex >= ownershipValuesStartIndex;

      for (let j = ctxIndex; j < ctxEnd; j += StylingIndex.Size) {
        const distantCtxProp = getProp(context, j);
        if (distantCtxProp === normalizedProp) {
          const distantCtxDirectiveIndex = getDirectiveIndexFromEntry(context, j);
          const distantCtxPlayerBuilderIndex = getPlayerBuilderIndex(context, j);
          const distantCtxValue = getValue(context, j);
          const distantCtxFlag = getPointers(context, j);

          if (allowValueChange(distantCtxValue, value, distantCtxDirectiveIndex, directiveIndex)) {
            // even if the entry isn't updated (by value or directiveIndex) then
            // it should still be moved over to the correct spot in the array so
            // the iteration loop is tighter.
            if (isInsideOwnershipArea) {
              swapMultiContextEntries(context, ctxIndex, j);
              totalUniqueValues++;
            }

            if (hasValueChanged(distantCtxFlag, distantCtxValue, value)) {
              if (value === null || value === undefined && value !== distantCtxValue) {
                valuesEntryShapeChange = true;
              }

              setValue(context, ctxIndex, value);

              // SKIP IF INITIAL CHECK
              // If the former `value` is `null` then it means that an initial value
              // could be being rendered on screen. If that is the case then there is
              // no point in updating the value incase it matches. In other words if the
              // new value is the exact same as the previously rendered value (which
              // happens to be the initial value) then do nothing.
              if (distantCtxValue !== null ||
                  hasInitialValueChanged(context, distantCtxFlag, value)) {
                setDirty(context, ctxIndex, true);
                dirty = true;
              }
            }

            if (distantCtxDirectiveIndex !== directiveIndex ||
                playerBuilderIndex !== distantCtxPlayerBuilderIndex) {
              setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex, directiveIndex);
            }
          }

          ctxIndex += StylingIndex.Size;
          continue propertiesLoop;
        }
      }

      // fallback case ... value not found at all in the context
      if (value != null) {
        valuesEntryShapeChange = true;
        totalUniqueValues++;
        const flag = prepareInitialFlag(context, normalizedProp, entryIsClassBased, sanitizer) |
            StylingFlags.Dirty;

        const insertionIndex = isInsideOwnershipArea ?
            ctxIndex :
            (ownershipValuesStartIndex + totalNewAllocatedSlots * StylingIndex.Size);
        insertNewMultiProperty(
            context, insertionIndex, entryIsClassBased, normalizedProp, flag, value, directiveIndex,
            playerBuilderIndex);

        totalNewAllocatedSlots++;
        ctxEnd += StylingIndex.Size;
        ctxIndex += StylingIndex.Size;

        dirty = true;
      }
    }
  }

  // STEP 3:
  // Remove (nullify) any existing entries in the context that were not apart of the
  // map input value that was passed into this algorithm for this directive.
  while (ctxIndex < ctxEnd) {
    valuesEntryShapeChange = true;  // some values are missing
    const ctxValue = getValue(context, ctxIndex);
    const ctxFlag = getPointers(context, ctxIndex);
    const ctxDirective = getDirectiveIndexFromEntry(context, ctxIndex);
    if (ctxValue != null) {
      valuesEntryShapeChange = true;
    }
    if (hasValueChanged(ctxFlag, ctxValue, null)) {
      setValue(context, ctxIndex, null);
      // only if the initial value is falsy then
      if (hasInitialValueChanged(context, ctxFlag, ctxValue)) {
        setDirty(context, ctxIndex, true);
        dirty = true;
      }
      setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex, directiveIndex);
    }
    ctxIndex += StylingIndex.Size;
  }

  // Because the object shape has changed, this means that all follow-up directives will need to
  // reapply their values into the object. For this to happen, the cached array needs to be updated
  // with dirty flags so that follow-up calls to `updateStylingMap` will reapply their styling code.
  // the reapplication of styling code within the context will reshape it and update the offset
  // values (also follow-up directives can write new values incase earlier directives set anything
  // to null due to removals or falsy values).
  valuesEntryShapeChange = valuesEntryShapeChange || existingCachedValueCount !== totalUniqueValues;
  updateCachedMapValue(
      context, directiveIndex, entryIsClassBased, cacheValue, ownershipValuesStartIndex, ctxEnd,
      totalUniqueValues, valuesEntryShapeChange);

  if (dirty) {
    setContextDirty(context, true);
    setDirectiveDirty(context, directiveIndex, true);
  }

  return totalNewAllocatedSlots;
}

/**
 * Sets and resolves a single class value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyling` is called.
 *
 * @param context The styling context that will be updated with the
 *    newly provided class value.
 * @param offset The index of the CSS class which is being updated.
 * @param addOrRemove Whether or not to add or remove the CSS class
 * @param directiveRef an optional reference to the directive responsible
 *    for this binding change. If present then style binding will only
 *    actualize if the directive has ownership over this binding
 *    (see styling.ts#directives for more information about the algorithm).
 * @param forceOverride whether or not to skip all directive prioritization
 *    and just apply the value regardless.
 */
export function updateClassProp(
    context: StylingContext, offset: number,
    input: boolean | BoundPlayerFactory<boolean|null>| null, directiveRef?: any,
    forceOverride?: boolean): void {
  updateSingleStylingValue(context, offset, input, true, directiveRef, forceOverride);
}

/**
 * Sets and resolves a single style value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyling` is called.
 *
 * Note that prop-level styling values are considered higher priority than any styling that
 * has been applied using `updateStylingMap`, therefore, when styling values are rendered
 * then any styles/classes that have been applied using this function will be considered first
 * (then multi values second and then initial values as a backup).
 *
 * @param context The styling context that will be updated with the
 *    newly provided style value.
 * @param offset The index of the property which is being updated.
 * @param value The CSS style value that will be assigned
 * @param directiveRef an optional reference to the directive responsible
 *    for this binding change. If present then style binding will only
 *    actualize if the directive has ownership over this binding
 *    (see styling.ts#directives for more information about the algorithm).
 * @param forceOverride whether or not to skip all directive prioritization
 *    and just apply the value regardless.
 */
export function updateStyleProp(
    context: StylingContext, offset: number,
    input: string | boolean | null | BoundPlayerFactory<string|boolean|null>, directiveRef?: any,
    forceOverride?: boolean): void {
  updateSingleStylingValue(context, offset, input, false, directiveRef, forceOverride);
}

function updateSingleStylingValue(
    context: StylingContext, offset: number,
    input: string | boolean | null | BoundPlayerFactory<string|boolean|null>, isClassBased: boolean,
    directiveRef: any, forceOverride?: boolean): void {
  const directiveIndex = getDirectiveIndexFromRegistry(context, directiveRef || null);
  const singleIndex = getSinglePropIndexValue(context, directiveIndex, offset, isClassBased);
  const currValue = getValue(context, singleIndex);
  const currFlag = getPointers(context, singleIndex);
  const currDirective = getDirectiveIndexFromEntry(context, singleIndex);
  const value: string|boolean|null = (input instanceof BoundPlayerFactory) ? input.value : input;

  if (hasValueChanged(currFlag, currValue, value) &&
      (forceOverride || allowValueChange(currValue, value, currDirective, directiveIndex))) {
    const isClassBased = (currFlag & StylingFlags.Class) === StylingFlags.Class;
    const element = context[StylingIndex.ElementPosition] !as HTMLElement;
    const playerBuilder = input instanceof BoundPlayerFactory ?
        new ClassAndStylePlayerBuilder(
            input as any, element, isClassBased ? BindingType.Class : BindingType.Style) :
        null;
    const value = (playerBuilder ? (input as BoundPlayerFactory<any>).value : input) as string |
        boolean | null;
    const currPlayerIndex = getPlayerBuilderIndex(context, singleIndex);

    let playerBuildersAreDirty = false;
    let playerBuilderIndex = playerBuilder ? currPlayerIndex : 0;
    if (hasPlayerBuilderChanged(context, playerBuilder, currPlayerIndex)) {
      const newIndex = setPlayerBuilder(context, playerBuilder, currPlayerIndex);
      playerBuilderIndex = playerBuilder ? newIndex : 0;
      playerBuildersAreDirty = true;
    }

    if (playerBuildersAreDirty || currDirective !== directiveIndex) {
      setPlayerBuilderIndex(context, singleIndex, playerBuilderIndex, directiveIndex);
    }

    if (currDirective !== directiveIndex) {
      const prop = getProp(context, singleIndex);
      const sanitizer = getStyleSanitizer(context, directiveIndex);
      setSanitizeFlag(context, singleIndex, (sanitizer && sanitizer(prop)) ? true : false);
    }

    // the value will always get updated (even if the dirty flag is skipped)
    setValue(context, singleIndex, value);
    const indexForMulti = getMultiOrSingleIndex(currFlag);

    // if the value is the same in the multi-area then there's no point in re-assembling
    const valueForMulti = getValue(context, indexForMulti);
    if (!valueForMulti || hasValueChanged(currFlag, valueForMulti, value)) {
      let multiDirty = false;
      let singleDirty = true;

      // only when the value is set to `null` should the multi-value get flagged
      if (!valueExists(value, isClassBased) && valueExists(valueForMulti, isClassBased)) {
        multiDirty = true;
        singleDirty = false;
      }

      setDirty(context, indexForMulti, multiDirty);
      setDirty(context, singleIndex, singleDirty);
      setDirectiveDirty(context, directiveIndex, true);
      setContextDirty(context, true);
    }

    if (playerBuildersAreDirty) {
      setContextPlayersDirty(context, true);
    }
  }
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
 * @param classesStore if provided, the updated class values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param stylesStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param directiveRef an optional directive that will be used to target which
 *    styling values are rendered. If left empty, only the bindings that are
 *    registered on the template will be rendered.
 * @returns number the total amount of players that got queued for animation (if any)
 */
export function renderStyling(
    context: StylingContext, renderer: Renderer3, rootOrView: RootContext | LView,
    isFirstRender: boolean, classesStore?: BindingStore | null, stylesStore?: BindingStore | null,
    directiveRef?: any): number {
  let totalPlayersQueued = 0;
  const targetDirectiveIndex = getDirectiveIndexFromRegistry(context, directiveRef || null);

  if (isContextDirty(context) && isDirectiveDirty(context, targetDirectiveIndex)) {
    const flushPlayerBuilders: any =
        context[StylingIndex.MasterFlagPosition] & StylingFlags.PlayerBuildersDirty;
    const native = context[StylingIndex.ElementPosition] !;
    const multiStartIndex = getMultiStylesStartIndex(context);

    let stillDirty = false;
    for (let i = StylingIndex.SingleStylesStartPosition; i < context.length;
         i += StylingIndex.Size) {
      // there is no point in rendering styles that have not changed on screen
      if (isDirty(context, i)) {
        const flag = getPointers(context, i);
        const directiveIndex = getDirectiveIndexFromEntry(context, i);
        if (targetDirectiveIndex !== directiveIndex) {
          stillDirty = true;
          continue;
        }

        const prop = getProp(context, i);
        const value = getValue(context, i);
        const styleSanitizer =
            (flag & StylingFlags.Sanitize) ? getStyleSanitizer(context, directiveIndex) : null;
        const playerBuilder = getPlayerBuilder(context, i);
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
        // Note that we ignore class-based deferals because otherwise a class can never
        // be removed in the case that it exists as true in the initial classes list...
        if (!valueExists(valueToApply, isClassBased)) {
          valueToApply = getInitialValue(context, flag);
        }

        // if the first render is true then we do not want to start applying falsy
        // values to the DOM element's styling. Otherwise then we know there has
        // been a change and even if it's falsy then it's removing something that
        // was truthy before.
        const doApplyValue = isFirstRender ? valueToApply : true;
        if (doApplyValue) {
          if (isClassBased) {
            setClass(
                native, prop, valueToApply ? true : false, renderer, classesStore, playerBuilder);
          } else {
            setStyle(
                native, prop, valueToApply as string | null, renderer, styleSanitizer, stylesStore,
                playerBuilder);
          }
        }

        setDirty(context, i, false);
      }
    }

    if (flushPlayerBuilders) {
      const rootContext =
          Array.isArray(rootOrView) ? getRootContext(rootOrView) : rootOrView as RootContext;
      const playerContext = getPlayerContext(context) !;
      const playersStartIndex = playerContext[PlayerIndex.NonBuilderPlayersStart];
      for (let i = PlayerIndex.PlayerBuildersStartPosition; i < playersStartIndex;
           i += PlayerIndex.PlayerAndPlayerBuildersTupleSize) {
        const builder = playerContext[i] as ClassAndStylePlayerBuilder<any>| null;
        const playerInsertionIndex = i + PlayerIndex.PlayerOffsetPosition;
        const oldPlayer = playerContext[playerInsertionIndex] as Player | null;
        if (builder) {
          const player = builder.buildPlayer(oldPlayer, isFirstRender);
          if (player !== undefined) {
            if (player != null) {
              const wasQueued = addPlayerInternal(
                  playerContext, rootContext, native as HTMLElement, player, playerInsertionIndex);
              wasQueued && totalPlayersQueued++;
            }
            if (oldPlayer) {
              oldPlayer.destroy();
            }
          }
        } else if (oldPlayer) {
          // the player builder has been removed ... therefore we should delete the associated
          // player
          oldPlayer.destroy();
        }
      }
      setContextPlayersDirty(context, false);
    }

    setDirectiveDirty(context, targetDirectiveIndex, false);
    setContextDirty(context, stillDirty);
  }

  return totalPlayersQueued;
}

/**
 * Assigns a style value to a style property for the given element.
 *
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
export function setStyle(
    native: any, prop: string, value: string | null, renderer: Renderer3,
    sanitizer: StyleSanitizeFn | null, store?: BindingStore | null,
    playerBuilder?: ClassAndStylePlayerBuilder<any>| null) {
  value = sanitizer && value ? sanitizer(prop, value) : value;
  if (store || playerBuilder) {
    if (store) {
      store.setValue(prop, value);
    }
    if (playerBuilder) {
      playerBuilder.setValue(prop, value);
    }
  } else if (value) {
    value = value.toString();  // opacity, z-index and flexbox all have number values which may not
    // assign as numbers
    ngDevMode && ngDevMode.rendererSetStyle++;
    isProceduralRenderer(renderer) ?
        renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
        native.style.setProperty(prop, value);
  } else {
    ngDevMode && ngDevMode.rendererRemoveStyle++;
    isProceduralRenderer(renderer) ?
        renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
        native.style.removeProperty(prop);
  }
}

/**
 * Adds/removes the provided className value to the provided element.
 *
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
    native: any, className: string, add: boolean, renderer: Renderer3, store?: BindingStore | null,
    playerBuilder?: ClassAndStylePlayerBuilder<any>| null) {
  if (store || playerBuilder) {
    if (store) {
      store.setValue(className, add);
    }
    if (playerBuilder) {
      playerBuilder.setValue(className, add);
    }
    // DOMTokenList will throw if we try to add or remove an empty string.
  } else if (className !== '') {
    if (add) {
      ngDevMode && ngDevMode.rendererAddClass++;
      isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
                                       native['classList'].add(className);
    } else {
      ngDevMode && ngDevMode.rendererRemoveClass++;
      isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
                                       native['classList'].remove(className);
    }
  }
}

function setSanitizeFlag(context: StylingContext, index: number, sanitizeYes: boolean) {
  if (sanitizeYes) {
    (context[index] as number) |= StylingFlags.Sanitize;
  } else {
    (context[index] as number) &= ~StylingFlags.Sanitize;
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

export function isClassBasedValue(context: StylingContext, index: number): boolean {
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

function getInitialValue(context: StylingContext, flag: number): string|boolean|null {
  const index = getInitialIndex(flag);
  const entryIsClassBased = flag & StylingFlags.Class;
  const initialValues = entryIsClassBased ? context[StylingIndex.InitialClassValuesPosition] :
                                            context[StylingIndex.InitialStyleValuesPosition];
  return initialValues[index];
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

function getMultiClassesStartIndex(context: StylingContext): number {
  const classCache = context[StylingIndex.CachedMultiClasses];
  return classCache
      [MapBasedOffsetValuesIndex.ValuesStartPosition +
       MapBasedOffsetValuesIndex.PositionStartOffset];
}

function getMultiStylesStartIndex(context: StylingContext): number {
  const stylesCache = context[StylingIndex.CachedMultiStyles];
  return stylesCache
      [MapBasedOffsetValuesIndex.ValuesStartPosition +
       MapBasedOffsetValuesIndex.PositionStartOffset];
}

function setProp(context: StylingContext, index: number, prop: string) {
  context[index + StylingIndex.PropertyOffset] = prop;
}

function setValue(context: StylingContext, index: number, value: string | null | boolean) {
  context[index + StylingIndex.ValueOffset] = value;
}

function hasPlayerBuilderChanged(
    context: StylingContext, builder: ClassAndStylePlayerBuilder<any>| null, index: number) {
  const playerContext = context[StylingIndex.PlayerContext] !;
  if (builder) {
    if (!playerContext || index === 0) {
      return true;
    }
  } else if (!playerContext) {
    return false;
  }
  return playerContext[index] !== builder;
}

function setPlayerBuilder(
    context: StylingContext, builder: ClassAndStylePlayerBuilder<any>| null,
    insertionIndex: number): number {
  let playerContext = context[StylingIndex.PlayerContext] || allocPlayerContext(context);
  if (insertionIndex > 0) {
    playerContext[insertionIndex] = builder;
  } else {
    insertionIndex = playerContext[PlayerIndex.NonBuilderPlayersStart];
    playerContext.splice(insertionIndex, 0, builder, null);
    playerContext[PlayerIndex.NonBuilderPlayersStart] +=
        PlayerIndex.PlayerAndPlayerBuildersTupleSize;
  }
  return insertionIndex;
}

export function directiveOwnerPointers(directiveIndex: number, playerIndex: number) {
  return (playerIndex << DirectiveOwnerAndPlayerBuilderIndex.BitCountSize) | directiveIndex;
}

function setPlayerBuilderIndex(
    context: StylingContext, index: number, playerBuilderIndex: number, directiveIndex: number) {
  const value = directiveOwnerPointers(directiveIndex, playerBuilderIndex);
  context[index + StylingIndex.PlayerBuilderIndexOffset] = value;
}

function getPlayerBuilderIndex(context: StylingContext, index: number): number {
  const flag = context[index + StylingIndex.PlayerBuilderIndexOffset] as number;
  const playerBuilderIndex = (flag >> DirectiveOwnerAndPlayerBuilderIndex.BitCountSize) &
      DirectiveOwnerAndPlayerBuilderIndex.BitMask;
  return playerBuilderIndex;
}

function getPlayerBuilder(context: StylingContext, index: number): ClassAndStylePlayerBuilder<any>|
    null {
  const playerBuilderIndex = getPlayerBuilderIndex(context, index);
  if (playerBuilderIndex) {
    const playerContext = context[StylingIndex.PlayerContext];
    if (playerContext) {
      return playerContext[playerBuilderIndex] as ClassAndStylePlayerBuilder<any>| null;
    }
  }
  return null;
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

export function getValue(context: StylingContext, index: number): string|boolean|null {
  return context[index + StylingIndex.ValueOffset] as string | boolean | null;
}

export function getProp(context: StylingContext, index: number): string {
  return context[index + StylingIndex.PropertyOffset] as string;
}

export function isContextDirty(context: StylingContext): boolean {
  return isDirty(context, StylingIndex.MasterFlagPosition);
}

export function setContextDirty(context: StylingContext, isDirtyYes: boolean): void {
  setDirty(context, StylingIndex.MasterFlagPosition, isDirtyYes);
}

export function setContextPlayersDirty(context: StylingContext, isDirtyYes: boolean): void {
  if (isDirtyYes) {
    (context[StylingIndex.MasterFlagPosition] as number) |= StylingFlags.PlayerBuildersDirty;
  } else {
    (context[StylingIndex.MasterFlagPosition] as number) &= ~StylingFlags.PlayerBuildersDirty;
  }
}

function swapMultiContextEntries(context: StylingContext, indexA: number, indexB: number) {
  if (indexA === indexB) return;

  const tmpValue = getValue(context, indexA);
  const tmpProp = getProp(context, indexA);
  const tmpFlag = getPointers(context, indexA);
  const tmpPlayerBuilderIndex = getPlayerBuilderIndex(context, indexA);
  const tmpDirectiveIndex = getDirectiveIndexFromEntry(context, indexA);

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
  const playerIndexA = getPlayerBuilderIndex(context, indexB);
  const directiveIndexA = getDirectiveIndexFromEntry(context, indexB);
  setPlayerBuilderIndex(context, indexA, playerIndexA, directiveIndexA);

  setValue(context, indexB, tmpValue);
  setProp(context, indexB, tmpProp);
  setFlag(context, indexB, tmpFlag);
  setPlayerBuilderIndex(context, indexB, tmpPlayerBuilderIndex, tmpDirectiveIndex);
}

function updateSinglePointerValues(context: StylingContext, indexStartPosition: number) {
  for (let i = indexStartPosition; i < context.length; i += StylingIndex.Size) {
    const multiFlag = getPointers(context, i);
    const singleIndex = getMultiOrSingleIndex(multiFlag);
    if (singleIndex > 0) {
      const singleFlag = getPointers(context, singleIndex);
      const initialIndexForSingle = getInitialIndex(singleFlag);
      const flagValue = (isDirty(context, singleIndex) ? StylingFlags.Dirty : StylingFlags.None) |
          (isClassBasedValue(context, singleIndex) ? StylingFlags.Class : StylingFlags.None) |
          (isSanitizable(context, singleIndex) ? StylingFlags.Sanitize : StylingFlags.None);
      const updatedFlag = pointers(flagValue, initialIndexForSingle, i);
      setFlag(context, singleIndex, updatedFlag);
    }
  }
}

function insertNewMultiProperty(
    context: StylingContext, index: number, classBased: boolean, name: string, flag: number,
    value: string | boolean, directiveIndex: number, playerIndex: number): void {
  const doShift = index < context.length;

  // prop does not exist in the list, add it in
  context.splice(
      index, 0, flag | StylingFlags.Dirty | (classBased ? StylingFlags.Class : StylingFlags.None),
      name, value, 0);
  setPlayerBuilderIndex(context, index, playerIndex, directiveIndex);

  if (doShift) {
    // because the value was inserted midway into the array then we
    // need to update all the shifted multi values' single value
    // pointers to point to the newly shifted location
    updateSinglePointerValues(context, index + StylingIndex.Size);
  }
}

function valueExists(value: string | null | boolean, isClassBased?: boolean) {
  return value !== null;
}

function prepareInitialFlag(
    context: StylingContext, prop: string, entryIsClassBased: boolean,
    sanitizer?: StyleSanitizeFn | null) {
  let flag = (sanitizer && sanitizer(prop)) ? StylingFlags.Sanitize : StylingFlags.None;

  let initialIndex: number;
  if (entryIsClassBased) {
    flag |= StylingFlags.Class;
    initialIndex =
        getInitialStylingValuesIndexOf(context[StylingIndex.InitialClassValuesPosition], prop);
  } else {
    initialIndex =
        getInitialStylingValuesIndexOf(context[StylingIndex.InitialStyleValuesPosition], prop);
  }

  initialIndex = initialIndex > 0 ? (initialIndex + InitialStylingValuesIndex.ValueOffset) : 0;
  return pointers(flag, initialIndex, 0);
}

function hasInitialValueChanged(context: StylingContext, flag: number, newValue: any) {
  const initialValue = getInitialValue(context, flag);
  return !initialValue || hasValueChanged(flag, initialValue, newValue);
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

export class ClassAndStylePlayerBuilder<T> implements PlayerBuilder {
  private _values: {[key: string]: string | null} = {};
  private _dirty = false;
  private _factory: BoundPlayerFactory<T>;

  constructor(factory: PlayerFactory, private _element: HTMLElement, private _type: BindingType) {
    this._factory = factory as any;
  }

  setValue(prop: string, value: any) {
    if (this._values[prop] !== value) {
      this._values[prop] = value;
      this._dirty = true;
    }
  }

  buildPlayer(currentPlayer: Player|null, isFirstRender: boolean): Player|undefined|null {
    // if no values have been set here then this means the binding didn't
    // change and therefore the binding values were not updated through
    // `setValue` which means no new player will be provided.
    if (this._dirty) {
      const player = this._factory.fn(
          this._element, this._type, this._values !, isFirstRender, currentPlayer || null);
      this._values = {};
      this._dirty = false;
      return player;
    }

    return undefined;
  }
}

/**
 * Used to provide a summary of the state of the styling context.
 *
 * This is an internal interface that is only used inside of test tooling to
 * help summarize what's going on within the styling context. None of this code
 * is designed to be exported publicly and will, therefore, be tree-shaken away
 * during runtime.
 */
export interface LogSummary {
  name: string;          //
  staticIndex: number;   //
  dynamicIndex: number;  //
  value: number;         //
  flags: {
    dirty: boolean;                    //
    class: boolean;                    //
    sanitize: boolean;                 //
    playerBuildersDirty: boolean;      //
    bindingAllocationLocked: boolean;  //
  };
}

/**
 * This function is not designed to be used in production.
 * It is a utility tool for debugging and testing and it
 * will automatically be tree-shaken away during production.
 */
export function generateConfigSummary(source: number): LogSummary;
export function generateConfigSummary(source: StylingContext): LogSummary;
export function generateConfigSummary(source: StylingContext, index: number): LogSummary;
export function generateConfigSummary(source: number | StylingContext, index?: number): LogSummary {
  let flag, name = 'config value for ';
  if (Array.isArray(source)) {
    if (index) {
      name += 'index: ' + index;
    } else {
      name += 'master config';
    }
    index = index || StylingIndex.MasterFlagPosition;
    flag = source[index] as number;
  } else {
    flag = source;
    name += 'index: ' + flag;
  }
  const dynamicIndex = getMultiOrSingleIndex(flag);
  const staticIndex = getInitialIndex(flag);
  return {
    name,
    staticIndex,
    dynamicIndex,
    value: flag,
    flags: {
      dirty: flag & StylingFlags.Dirty ? true : false,
      class: flag & StylingFlags.Class ? true : false,
      sanitize: flag & StylingFlags.Sanitize ? true : false,
      playerBuildersDirty: flag & StylingFlags.PlayerBuildersDirty ? true : false,
      bindingAllocationLocked: flag & StylingFlags.BindingAllocationLocked ? true : false,
    }
  };
}

export function getDirectiveIndexFromEntry(context: StylingContext, index: number) {
  const value = context[index + StylingIndex.PlayerBuilderIndexOffset] as number;
  return value & DirectiveOwnerAndPlayerBuilderIndex.BitMask;
}

function getDirectiveIndexFromRegistry(context: StylingContext, directiveRef: any) {
  let directiveIndex: number;

  const dirs = context[StylingIndex.DirectiveRegistryPosition];
  let index = getDirectiveRegistryValuesIndexOf(dirs, directiveRef);
  if (index === -1) {
    // if the directive was not allocated then this means that styling is
    // being applied in a dynamic way AFTER the element was already instantiated
    index = dirs.length;
    directiveIndex = index > 0 ? index / DirectiveRegistryValuesIndex.Size : 0;

    dirs.push(null, null, null, null);
    dirs[index + DirectiveRegistryValuesIndex.DirectiveValueOffset] = directiveRef;
    dirs[index + DirectiveRegistryValuesIndex.DirtyFlagOffset] = false;
    dirs[index + DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset] = -1;

    const classesStartIndex =
        getMultiClassesStartIndex(context) || StylingIndex.SingleStylesStartPosition;
    registerMultiMapEntry(context, directiveIndex, true, context.length);
    registerMultiMapEntry(context, directiveIndex, false, classesStartIndex);
  } else {
    directiveIndex = index > 0 ? index / DirectiveRegistryValuesIndex.Size : 0;
  }

  return directiveIndex;
}

function getDirectiveRegistryValuesIndexOf(
    directives: DirectiveRegistryValues, directive: {}): number {
  for (let i = 0; i < directives.length; i += DirectiveRegistryValuesIndex.Size) {
    if (directives[i] === directive) {
      return i;
    }
  }
  return -1;
}

function getInitialStylingValuesIndexOf(keyValues: InitialStylingValues, key: string): number {
  for (let i = InitialStylingValuesIndex.KeyValueStartPosition; i < keyValues.length;
       i += InitialStylingValuesIndex.Size) {
    if (keyValues[i] === key) return i;
  }
  return -1;
}

export function compareLogSummaries(a: LogSummary, b: LogSummary) {
  const log: string[] = [];
  const diffs: [string, any, any][] = [];
  diffSummaryValues(diffs, 'staticIndex', 'staticIndex', a, b);
  diffSummaryValues(diffs, 'dynamicIndex', 'dynamicIndex', a, b);
  Object.keys(a.flags).forEach(
      name => { diffSummaryValues(diffs, 'flags.' + name, name, a.flags, b.flags); });

  if (diffs.length) {
    log.push('Log Summaries for:');
    log.push('  A: ' + a.name);
    log.push('  B: ' + b.name);
    log.push('\n  Differ in the following way (A !== B):');
    diffs.forEach(result => {
      const [name, aVal, bVal] = result;
      log.push('    => ' + name);
      log.push('    => ' + aVal + ' !== ' + bVal + '\n');
    });
  }

  return log;
}

function diffSummaryValues(result: any[], name: string, prop: string, a: any, b: any) {
  const aVal = a[prop];
  const bVal = b[prop];
  if (aVal !== bVal) {
    result.push([name, aVal, bVal]);
  }
}

function getSinglePropIndexValue(
    context: StylingContext, directiveIndex: number, offset: number, isClassBased: boolean) {
  const singlePropOffsetRegistryIndex =
      context[StylingIndex.DirectiveRegistryPosition]
             [(directiveIndex * DirectiveRegistryValuesIndex.Size) +
              DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset] as number;
  const offsets = context[StylingIndex.SinglePropOffsetPositions];
  const indexForOffset = singlePropOffsetRegistryIndex +
      SinglePropOffsetValuesIndex.ValueStartPosition +
      (isClassBased ?
           offsets
               [singlePropOffsetRegistryIndex + SinglePropOffsetValuesIndex.StylesCountPosition] :
           0) +
      offset;
  return offsets[indexForOffset];
}

function getStyleSanitizer(context: StylingContext, directiveIndex: number): StyleSanitizeFn|null {
  const dirs = context[StylingIndex.DirectiveRegistryPosition];
  const value = dirs
                    [directiveIndex * DirectiveRegistryValuesIndex.Size +
                     DirectiveRegistryValuesIndex.StyleSanitizerOffset] ||
      dirs[DirectiveRegistryValuesIndex.StyleSanitizerOffset] || null;
  return value as StyleSanitizeFn | null;
}

function isDirectiveDirty(context: StylingContext, directiveIndex: number): boolean {
  const dirs = context[StylingIndex.DirectiveRegistryPosition];
  return dirs
      [directiveIndex * DirectiveRegistryValuesIndex.Size +
       DirectiveRegistryValuesIndex.DirtyFlagOffset] as boolean;
}

function setDirectiveDirty(
    context: StylingContext, directiveIndex: number, dirtyYes: boolean): void {
  const dirs = context[StylingIndex.DirectiveRegistryPosition];
  dirs
      [directiveIndex * DirectiveRegistryValuesIndex.Size +
       DirectiveRegistryValuesIndex.DirtyFlagOffset] = dirtyYes;
}

function allowValueChange(
    currentValue: string | boolean | null, newValue: string | boolean | null,
    currentDirectiveOwner: number, newDirectiveOwner: number) {
  // the code below relies the importance of directive's being tied to their
  // index value. The index values for each directive are derived from being
  // registered into the styling context directive registry. The most important
  // directive is the parent component directive (the template) and each directive
  // that is added after is considered less important than the previous entry. This
  // prioritization of directives enables the styling algorithm to decide if a style
  // or class should be allowed to be updated/replaced incase an earlier directive
  // already wrote to the exact same style-property or className value. In other words
  // this decides what to do if and when there is a collision.
  if (currentValue != null) {
    if (newValue != null) {
      // if a directive index is lower than it always has priority over the
      // previous directive's value...
      return newDirectiveOwner <= currentDirectiveOwner;
    } else {
      // only write a null value incase it's the same owner writing it.
      // this avoids having a higher-priority directive write to null
      // only to have a lesser-priority directive change right to a
      // non-null value immediately afterwards.
      return currentDirectiveOwner === newDirectiveOwner;
    }
  }
  return true;
}

/**
 * Returns the className string of all the initial classes for the element.
 *
 * This function is designed to populate and cache all the static class
 * values into a className string. The caching mechanism works by placing
 * the completed className string into the initial values array into a
 * dedicated slot. This will prevent the function from having to populate
 * the string each time an element is created or matched.
 *
 * @returns the className string (e.g. `on active red`)
 */
export function getInitialClassNameValue(context: StylingContext): string {
  const initialClassValues = context[StylingIndex.InitialClassValuesPosition];
  let className = initialClassValues[InitialStylingValuesIndex.InitialClassesStringPosition];
  if (className === null) {
    className = '';
    for (let i = InitialStylingValuesIndex.KeyValueStartPosition; i < initialClassValues.length;
         i += InitialStylingValuesIndex.Size) {
      const isPresent = initialClassValues[i + 1];
      if (isPresent) {
        className += (className.length ? ' ' : '') + initialClassValues[i];
      }
    }
    initialClassValues[InitialStylingValuesIndex.InitialClassesStringPosition] = className;
  }
  return className;
}

/**
 * Returns the style string of all the initial styles for the element.
 *
 * This function is designed to populate and cache all the static style
 * values into a style string. The caching mechanism works by placing
 * the completed style string into the initial values array into a
 * dedicated slot. This will prevent the function from having to populate
 * the string each time an element is created or matched.
 *
 * @returns the style string (e.g. `width:100px;height:200px`)
 */
export function getInitialStyleStringValue(context: StylingContext): string {
  const initialStyleValues = context[StylingIndex.InitialStyleValuesPosition];
  let styleString = initialStyleValues[InitialStylingValuesIndex.InitialClassesStringPosition];
  if (styleString === null) {
    styleString = '';
    for (let i = InitialStylingValuesIndex.KeyValueStartPosition; i < initialStyleValues.length;
         i += InitialStylingValuesIndex.Size) {
      const value = initialStyleValues[i + 1];
      if (value !== null) {
        styleString += (styleString.length ? ';' : '') + `${initialStyleValues[i]}:${value}`;
      }
    }
    initialStyleValues[InitialStylingValuesIndex.InitialClassesStringPosition] = styleString;
  }
  return styleString;
}

/**
 * Returns the current cached mutli-value for a given directiveIndex within the provided context.
 */
function readCachedMapValue(
    context: StylingContext, entryIsClassBased: boolean, directiveIndex: number) {
  const values: MapBasedOffsetValues =
      context[entryIsClassBased ? StylingIndex.CachedMultiClasses : StylingIndex.CachedMultiStyles];
  const index = MapBasedOffsetValuesIndex.ValuesStartPosition +
      directiveIndex * MapBasedOffsetValuesIndex.Size;
  return values[index + MapBasedOffsetValuesIndex.ValueOffset] || null;
}

/**
 * Determines whether the provided multi styling value should be updated or not.
 *
 * Because `[style]` and `[class]` bindings rely on an identity change to occur before
 * applying new values, the styling algorithm may not update an existing entry into
 * the context if a previous directive's entry changed shape.
 *
 * This function will decide whether or not a value should be applied (if there is a
 * cache miss) to the context based on the following rules:
 *
 * - If there is an identity change between the existing value and new value
 * - If there is no existing value cached (first write)
 * - If a previous directive flagged the existing cached value as dirty
 */
function isMultiValueCacheHit(
    context: StylingContext, entryIsClassBased: boolean, directiveIndex: number,
    newValue: any): boolean {
  const indexOfCachedValues =
      entryIsClassBased ? StylingIndex.CachedMultiClasses : StylingIndex.CachedMultiStyles;
  const cachedValues = context[indexOfCachedValues] as MapBasedOffsetValues;
  const index = MapBasedOffsetValuesIndex.ValuesStartPosition +
      directiveIndex * MapBasedOffsetValuesIndex.Size;
  if (cachedValues[index + MapBasedOffsetValuesIndex.DirtyFlagOffset]) return false;
  return newValue === NO_CHANGE ||
      readCachedMapValue(context, entryIsClassBased, directiveIndex) === newValue;
}

/**
 * Updates the cached status of a multi-styling value in the context.
 *
 * The cached map array (which exists in the context) contains a manifest of
 * each multi-styling entry (`[style]` and `[class]` entries) for the template
 * as well as all directives.
 *
 * This function will update the cached status of the provided multi-style
 * entry within the cache.
 *
 * When called, this function will update the following information:
 * - The actual cached value (the raw value that was passed into `[style]` or `[class]`)
 * - The total amount of unique styling entries that this value has written into the context
 * - The exact position of where the multi styling entries start in the context for this binding
 * - The dirty flag will be set to true
 *
 * If the `dirtyFutureValues` param is provided then it will update all future entries (binding
 * entries that exist as apart of other directives) to be dirty as well. This will force the
 * styling algorithm to reapply those values once change detection checks them (which will in
 * turn cause the styling context to update itself and the correct styling values will be
 * rendered on screen).
 */
function updateCachedMapValue(
    context: StylingContext, directiveIndex: number, entryIsClassBased: boolean, cacheValue: any,
    startPosition: number, endPosition: number, totalValues: number, dirtyFutureValues: boolean) {
  const values =
      context[entryIsClassBased ? StylingIndex.CachedMultiClasses : StylingIndex.CachedMultiStyles];

  const index = MapBasedOffsetValuesIndex.ValuesStartPosition +
      directiveIndex * MapBasedOffsetValuesIndex.Size;

  // in the event that this is true we assume that future values are dirty and therefore
  // will be checked again in the next CD cycle
  if (dirtyFutureValues) {
    const nextStartPosition = startPosition + totalValues * MapBasedOffsetValuesIndex.Size;
    for (let i = index + MapBasedOffsetValuesIndex.Size; i < values.length;
         i += MapBasedOffsetValuesIndex.Size) {
      values[i + MapBasedOffsetValuesIndex.PositionStartOffset] = nextStartPosition;
      values[i + MapBasedOffsetValuesIndex.DirtyFlagOffset] = 1;
    }
  }

  values[index + MapBasedOffsetValuesIndex.DirtyFlagOffset] = 0;
  values[index + MapBasedOffsetValuesIndex.PositionStartOffset] = startPosition;
  values[index + MapBasedOffsetValuesIndex.ValueOffset] = cacheValue;
  values[index + MapBasedOffsetValuesIndex.ValueCountOffset] = totalValues;

  // the code below counts the total amount of styling values that exist in
  // the context up until this directive. This value will be later used to
  // update the cached value map's total counter value.
  let totalStylingEntries = totalValues;
  for (let i = MapBasedOffsetValuesIndex.ValuesStartPosition; i < index;
       i += MapBasedOffsetValuesIndex.Size) {
    totalStylingEntries += values[i + MapBasedOffsetValuesIndex.ValueCountOffset];
  }

  // because style values come before class values in the context this means
  // that if any new values were inserted then the cache values array for
  // classes is out of sync. The code below will update the offsets to point
  // to their new values.
  if (!entryIsClassBased) {
    const classCache = context[StylingIndex.CachedMultiClasses];
    const classesStartPosition = classCache
        [MapBasedOffsetValuesIndex.ValuesStartPosition +
         MapBasedOffsetValuesIndex.PositionStartOffset];
    const diffInStartPosition = endPosition - classesStartPosition;
    for (let i = MapBasedOffsetValuesIndex.ValuesStartPosition; i < classCache.length;
         i += MapBasedOffsetValuesIndex.Size) {
      classCache[i + MapBasedOffsetValuesIndex.PositionStartOffset] += diffInStartPosition;
    }
  }

  values[MapBasedOffsetValuesIndex.EntriesCountPosition] = totalStylingEntries;
}

function hyphenateEntries(entries: string[]): string[] {
  const newEntries: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    newEntries.push(hyphenate(entries[i]));
  }
  return newEntries;
}

function hyphenate(value: string): string {
  return value.replace(
      /[a-z][A-Z]/g, match => `${match.charAt(0)}-${match.charAt(1).toLowerCase()}`);
}

function registerMultiMapEntry(
    context: StylingContext, directiveIndex: number, entryIsClassBased: boolean,
    startPosition: number, count = 0) {
  const cachedValues =
      context[entryIsClassBased ? StylingIndex.CachedMultiClasses : StylingIndex.CachedMultiStyles];
  if (directiveIndex > 0) {
    const limit = MapBasedOffsetValuesIndex.ValuesStartPosition +
        (directiveIndex * MapBasedOffsetValuesIndex.Size);
    while (cachedValues.length < limit) {
      // this means that ONLY directive class styling (like ngClass) was used
      // therefore the root directive will still need to be filled in as well
      // as any other directive spaces incase they only used static values
      cachedValues.push(0, startPosition, null, 0);
    }
  }
  cachedValues.push(0, startPosition, null, count);
}
