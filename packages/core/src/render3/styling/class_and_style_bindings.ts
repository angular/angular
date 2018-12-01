/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {InitialStylingFlags} from '../interfaces/definition';
import {BindingStore, BindingType, Player, PlayerBuilder, PlayerFactory, PlayerIndex} from '../interfaces/player';
import {Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {InitialStyles, StylingContext, StylingFlags, StylingIndex} from '../interfaces/styling';
import {LView, RootContext} from '../interfaces/view';
import {NO_CHANGE} from '../tokens';
import {getRootContext} from '../util';

import {BoundPlayerFactory} from './player_factory';
import {addPlayerInternal, allocPlayerContext, createEmptyStylingContext, getPlayerContext} from './util';

const EMPTY_ARR: any[] = [];
const EMPTY_OBJ: {[key: string]: any} = {};


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
    styleSanitizer?: StyleSanitizeFn | null, onlyProcessSingleClasses?: boolean): StylingContext {
  const initialStylingValues: InitialStyles = [null];
  const context: StylingContext =
      createEmptyStylingContext(null, styleSanitizer, initialStylingValues);

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

  const initialStaticClasses: string[]|null = onlyProcessSingleClasses ? [] : null;
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
          initialStaticClasses && initialStaticClasses.push(className);
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
    setPlayerBuilderIndex(context, indexForSingle, 0);

    const flagForMulti =
        initialFlag | (initialValue !== null ? StylingFlags.Dirty : StylingFlags.None);
    setFlag(context, indexForMulti, pointers(flagForMulti, indexForInitial, indexForSingle));
    setProp(context, indexForMulti, prop);
    setValue(context, indexForMulti, null);
    setPlayerBuilderIndex(context, indexForMulti, 0);
  }

  // there is no initial value flag for the master index since it doesn't
  // reference an initial style value
  const masterFlag = pointers(0, 0, multiStart) |
      (onlyProcessSingleClasses ? StylingFlags.OnlyProcessSingleClasses : 0);
  setFlag(context, StylingIndex.MasterFlagPosition, masterFlag);
  setContextDirty(context, initialStylingValues.length > 1);

  if (initialStaticClasses) {
    context[StylingIndex.PreviousOrCachedMultiClassValue] = initialStaticClasses.join(' ');
  }

  return context;
}

/**
 * Sets and resolves all `multi` styling on an `StylingContext` so that they can be
 * applied to the element once `renderStyleAndClassBindings` is called.
 *
 * All missing styles/class (any values that are not provided in the new `styles`
 * or `classes` params) will resolve to `null` within their respective positions
 * in the context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided style values.
 * @param classesInput The key/value map of CSS class names that will be used for the update.
 * @param stylesInput The key/value map of CSS styles that will be used for the update.
 */
export function updateStylingMap(
    context: StylingContext, classesInput: {[key: string]: any} | string |
        BoundPlayerFactory<null|string|{[key: string]: any}>| NO_CHANGE | null,
    stylesInput?: {[key: string]: any} | BoundPlayerFactory<null|{[key: string]: any}>| NO_CHANGE |
        null): void {
  stylesInput = stylesInput || null;

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
  // early exit (this is what's done to avoid using ctx.bind() to cache the value)
  const ignoreAllClassUpdates = limitToSingleClasses(context) || classesValue === NO_CHANGE ||
      classesValue === context[StylingIndex.PreviousOrCachedMultiClassValue];
  const ignoreAllStyleUpdates =
      stylesValue === NO_CHANGE || stylesValue === context[StylingIndex.PreviousMultiStyleValue];
  if (ignoreAllClassUpdates && ignoreAllStyleUpdates) return;

  context[StylingIndex.PreviousOrCachedMultiClassValue] = classesValue;
  context[StylingIndex.PreviousMultiStyleValue] = stylesValue;

  let classNames: string[] = EMPTY_ARR;
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
      classNames = classesValue ? Object.keys(classesValue) : EMPTY_ARR;
    }
  }

  const classes = (classesValue || EMPTY_OBJ) as{[key: string]: any};
  const styleProps = stylesValue ? Object.keys(stylesValue) : EMPTY_ARR;
  const styles = stylesValue || EMPTY_OBJ;

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
    const processValue =
        (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);

    // when there is a cache-hit for a string-based class then we should
    // avoid doing any work diffing any of the changes
    if (processValue) {
      const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
      const newProp: string =
          isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
      const newValue: string|boolean =
          isClassBased ? (applyAllClasses ? true : classes[newProp]) : styles[newProp];
      const playerBuilderIndex =
          isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;

      const prop = getProp(context, ctxIndex);
      if (prop === newProp) {
        const value = getValue(context, ctxIndex);
        const flag = getPointers(context, ctxIndex);
        setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex);

        if (hasValueChanged(flag, value, newValue)) {
          setValue(context, ctxIndex, newValue);
          playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;

          const initialValue = getInitialValue(context, flag);

          // there is no point in setting this to dirty if the previously
          // rendered value was being referenced by the initial style (or null)
          if (hasValueChanged(flag, initialValue, newValue)) {
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
          if (hasValueChanged(flagToCompare, valueToCompare, newValue)) {
            const initialValue = getInitialValue(context, flagToCompare);
            setValue(context, ctxIndex, newValue);
            if (hasValueChanged(flagToCompare, initialValue, newValue)) {
              setDirty(context, ctxIndex, true);
              playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
              dirty = true;
            }
          }
        } else {
          // we only care to do this if the insertion is in the middle
          const newFlag = prepareInitialFlag(newProp, isClassBased, getStyleSanitizer(context));
          playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
          insertNewMultiProperty(
              context, ctxIndex, isClassBased, newProp, newFlag, newValue, playerBuilderIndex);
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
    const processValue =
        (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
    if (processValue) {
      const value = getValue(context, ctxIndex);
      const doRemoveValue = valueExists(value, isClassBased);
      if (doRemoveValue) {
        setDirty(context, ctxIndex, true);
        setValue(context, ctxIndex, null);

        // we keep the player factory the same so that the `nulled` value can
        // be instructed into the player because removing a style and/or a class
        // is a valid animation player instruction.
        const playerBuilderIndex =
            isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
        setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex);
        dirty = true;
      }
    }
    ctxIndex += StylingIndex.Size;
  }

  // this means that there are left-over properties in the context that
  // were not detected in the context during the loop above. In that
  // case we want to add the new entries into the list
  const sanitizer = getStyleSanitizer(context);
  while (propIndex < propLimit) {
    const isClassBased = propIndex >= classesStartIndex;
    const processValue =
        (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
    if (processValue) {
      const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
      const prop = isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
      const value: string|boolean =
          isClassBased ? (applyAllClasses ? true : classes[prop]) : styles[prop];
      const flag = prepareInitialFlag(prop, isClassBased, sanitizer) | StylingFlags.Dirty;
      const playerBuilderIndex =
          isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
      context.push(flag, prop, value, playerBuilderIndex);
      dirty = true;
    }
    propIndex++;
  }

  if (dirty) {
    setContextDirty(context, true);
  }

  if (playerBuildersAreDirty) {
    setContextPlayersDirty(context, true);
  }
}

/**
 * Sets and resolves a single styling property/value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyleAndClassBindings` is called.
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
    context: StylingContext, index: number,
    input: string | boolean | null | BoundPlayerFactory<string|boolean|null>): void {
  const singleIndex = StylingIndex.SingleStylesStartPosition + index * StylingIndex.Size;
  const currValue = getValue(context, singleIndex);
  const currFlag = getPointers(context, singleIndex);
  const value: string|boolean|null = (input instanceof BoundPlayerFactory) ? input.value : input;

  // didn't change ... nothing to make a note of
  if (hasValueChanged(currFlag, currValue, value)) {
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
      setPlayerBuilderIndex(context, singleIndex, playerBuilderIndex);
      playerBuildersAreDirty = true;
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
      setContextDirty(context, true);
    }

    if (playerBuildersAreDirty) {
      setContextPlayersDirty(context, true);
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
    context: StylingContext, index: number,
    addOrRemove: boolean | BoundPlayerFactory<boolean>): void {
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
 * @param classesStore if provided, the updated class values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param stylesStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @returns number the total amount of players that got queued for animation (if any)
 */
export function renderStyleAndClassBindings(
    context: StylingContext, renderer: Renderer3, rootOrView: RootContext | LView,
    isFirstRender: boolean, classesStore?: BindingStore | null,
    stylesStore?: BindingStore | null): number {
  let totalPlayersQueued = 0;

  if (isContextDirty(context)) {
    const flushPlayerBuilders: any =
        context[StylingIndex.MasterFlagPosition] & StylingFlags.PlayerBuildersDirty;
    const native = context[StylingIndex.ElementPosition] !;
    const multiStartIndex = getMultiStartIndex(context);
    const styleSanitizer = getStyleSanitizer(context);
    const onlySingleClasses = limitToSingleClasses(context);

    for (let i = StylingIndex.SingleStylesStartPosition; i < context.length;
         i += StylingIndex.Size) {
      // there is no point in rendering styles that have not changed on screen
      if (isDirty(context, i)) {
        const prop = getProp(context, i);
        const value = getValue(context, i);
        const flag = getPointers(context, i);
        const playerBuilder = getPlayerBuilder(context, i);
        const isClassBased = flag & StylingFlags.Class ? true : false;
        const isInSingleRegion = i < multiStartIndex;
        const readInitialValue = !isClassBased || !onlySingleClasses;

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
        if (!valueExists(valueToApply, isClassBased) && readInitialValue) {
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
            const sanitizer = (flag & StylingFlags.Sanitize) ? styleSanitizer : null;
            setStyle(
                native, prop, valueToApply as string | null, renderer, sanitizer, stylesStore,
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
    setContextDirty(context, false);
  }

  return totalPlayersQueued;
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
    native: any, className: string, add: boolean, renderer: Renderer3, store?: BindingStore | null,
    playerBuilder?: ClassAndStylePlayerBuilder<any>| null) {
  if (store || playerBuilder) {
    if (store) {
      store.setValue(className, add);
    }
    if (playerBuilder) {
      playerBuilder.setValue(className, add);
    }
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

function setPlayerBuilderIndex(context: StylingContext, index: number, playerBuilderIndex: number) {
  context[index + StylingIndex.PlayerBuilderIndexOffset] = playerBuilderIndex;
}

function getPlayerBuilderIndex(context: StylingContext, index: number): number {
  return (context[index + StylingIndex.PlayerBuilderIndexOffset] as number) || 0;
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

function getValue(context: StylingContext, index: number): string|boolean|null {
  return context[index + StylingIndex.ValueOffset] as string | boolean | null;
}

function getProp(context: StylingContext, index: number): string {
  return context[index + StylingIndex.PropertyOffset] as string;
}

export function isContextDirty(context: StylingContext): boolean {
  return isDirty(context, StylingIndex.MasterFlagPosition);
}

export function limitToSingleClasses(context: StylingContext) {
  return context[StylingIndex.MasterFlagPosition] & StylingFlags.OnlyProcessSingleClasses;
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
  const tmpPlayerBuilderIndex = getPlayerBuilderIndex(context, indexA);

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
  setPlayerBuilderIndex(context, indexA, getPlayerBuilderIndex(context, indexB));

  setValue(context, indexB, tmpValue);
  setProp(context, indexB, tmpProp);
  setFlag(context, indexB, tmpFlag);
  setPlayerBuilderIndex(context, indexB, tmpPlayerBuilderIndex);
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
    value: string | boolean, playerIndex: number): void {
  const doShift = index < context.length;

  // prop does not exist in the list, add it in
  context.splice(
      index, 0, flag | StylingFlags.Dirty | (classBased ? StylingFlags.Class : StylingFlags.None),
      name, value, playerIndex);

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
