/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {RElement} from '../interfaces/renderer';
import {PlayerContext} from './player';

/**
 * The styling context acts as a styling manifest (shaped as an array) for determining which
 * styling properties have been assigned via the provided `updateStylingMap`, `updateStyleProp`
 * and `updateClassProp` functions. It also stores the static style/class values that were
 * extracted from the template by the compiler.
 *
 * A context is created by Angular when:
 * 1. An element contains static styling values (like style="..." or class="...")
 * 2. An element contains single property binding values (like [style.prop]="x" or
 * [class.prop]="y")
 * 3. An element contains multi property binding values (like [style]="x" or [class]="y")
 * 4. A directive contains host bindings for static, single or multi styling properties/bindings.
 * 5. An animation player is added to an element via `addPlayer`
 *
 * Note that even if an element contains static styling then this context will be created and
 * attached to it. The reason why this happens (instead of treating styles/classes as regular
 * HTML attributes) is because the style/class bindings must be able to default themselves back
 * to their respective static values when they are set to null.
 *
 * Say for example we have this:
 * ```
 * <!-- when myWidthExp=null then a width of "100px"
 *      will be used a default value for width -->
 * <div style="width:100px" [style.width]="myWidthExp"></div>
 * ```
 *
 * Even in the situation where there are no bindings, the static styling is still placed into the
 * context because there may be another directive on the same element that has styling.
 *
 * When Angular initializes styling data for an element then it will first register the static
 * styling values on the element using one of these two instructions:
 *
 * 1. elementStart or element (within the template function of a component)
 * 2. elementHostAttrs (for directive host bindings)
 *
 * In either case, a styling context will be created and stored within an element's LViewData. Once
 * the styling context is created then single and multi properties can stored within it. For this to
 * happen, the following function needs to be called:
 *
 * `elementStyling` (called with style properties, class properties and a sanitizer + a directive
 * instance).
 *
 * When this instruction is called it will populate the styling context with the provided style
 * and class names into the context.
 *
 * The context itself looks like this:
 *
 * context = [
 *   // 0-8: header values (about 8 entries of configuration data)
 *   // 9+: this is where each entry is stored:
 * ]
 *
 * Let's say we have the following template code:
 *
 * ```
 * <div class="foo bar"
 *      style="width:200px; color:red"
 *      [style.width]="myWidthExp"
 *      [style.height]="myHeightExp"
 *      [class.baz]="myBazExp">
 * ```
 *
 * The context generated from these values will look like this (note that
 * for each binding name (the class and style bindings) the values will
 * be inserted twice into the array (once for single property entries) and
 * another for multi property entries).
 *
 * context = [
 *   // 0-8: header values (about 8 entries of configuration data)
 *   // 9+: this is where each entry is stored:
 *
 *   // SINGLE PROPERTIES
 *   configForWidth,
 *   'width'
 *   myWidthExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForHeight,
 *   'height'
 *   myHeightExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForBazClass,
 *   'baz
 *   myBazClassExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   // MULTI PROPERTIES
 *   configForWidth,
 *   'width'
 *   myWidthExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForHeight,
 *   'height'
 *   myHeightExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForBazClass,
 *   'baz
 *   myBazClassExp, // the binding value not the binding itself
 *   0, // the directive owner
 * ]
 *
 * The configuration values are left out of the example above because
 * the ordering of them could change between code patches. Please read the
 * documentation below to get a better understand of what the configuration
 * values are and how they work.
 *
 * Each time a binding property is updated (whether it be through a single
 * property instruction like `elementStyleProp`, `elementClassProp` or
 * `elementStylingMap`) then the values in the context will be updated as
 * well.
 *
 * If for example `[style.width]` updates to `555px` then its value will be reflected
 * in the context as so:
 *
 * context = [
 *   // ...
 *   configForWidth, // this will be marked DIRTY
 *   'width'
 *   '555px',
 *   0,
 *   //..
 * ]
 *
 * The context and directive data will also be marked dirty.
 *
 * Despite the context being updated, nothing has been rendered on screen (not styles or
 * classes have been set on the element). To kick off rendering for an element the following
 * function needs to be run `elementStylingApply`.
 *
 * `elementStylingApply` will run through the context and find each dirty value and render them onto
 * the element. Once complete, all styles/classes will be set to clean. Because of this, the render
 * function will now know not to rerun itself again if called again unless new style/class values
 * have changed.
 *
 * ## Directives
 * Directives style values (which are provided through host bindings) are also supported and
 * housed within the same styling context as are template-level style/class properties/bindings.
 * Both directive-level and template-level styling bindings share the same context.
 *
 * Each of the following instructions supports accepting a directive instance as an input parameter:
 *
 * - `elementHostAttrs`
 * - `elementStyling`
 * - `elementStyleProp`
 * - `elementClassProp`
 * - `elementStylingMap`
 * - `elementStylingApply`
 *
 * Each time a directiveRef is passed in, it will be converted into an index by examining the
 * directive registry (which lives in the context configuration area). The index is then used
 * to help single style properties figure out where a value is located in the context.
 *
 * If two directives or a directive + a template binding both write to the same style/class
 * binding then the styling context code will decide which one wins based on the following
 * rule:
 *
 * 1. If the template binding has a value then it always wins
 * 2. If not then whichever first-registered directive that has that value first will win
 *
 * The code example helps make this clear:
 *
 * ```
 * <div [style.width]="myWidth" [my-width-directive]="'600px">
 * @Directive({ selector: '[my-width-directive' ]})
 * class MyWidthDirective {
 *   @Input('my-width-directive')
 *   @HostBinding('style.width')
 *   public width = null;
 * }
 * ```
 *
 * Since there is a style binding for width present on the element (`[style.width]`) then
 * it will always win over the width binding that is present as a host binding within
 * the `MyWidthDirective`. However, if `[style.width]` renders as `null` (so `myWidth=null`)
 * then the `MyWidthDirective` will be able to write to the `width` style within the context.
 * Simply put, whichever directive writes to a value ends up having ownership of it.
 *
 * The way in which the ownership is facilitated is through index value. The earliest directives
 * get the smallest index values (with 0 being reserved for the template element bindings). Each
 * time a value is written from a directive or the template bindings, the value itself gets
 * assigned the directive index value in its data. If another directive writes a value again then
 * its directive index gets compared against the directive index that exists on the element. Only
 * when the new value's directive index is less than the existing directive index then the new
 * value will be written to the context.
 *
 * Each directive also has its own sanitizer and dirty flags. These values are consumed within the
 * rendering function.
 */
export interface StylingContext extends
    Array<{[key: string]: any}|number|string|boolean|RElement|StyleSanitizeFn|PlayerContext|null> {
  /**
   * A numeric value representing the configuration status (whether the context is dirty or not)
   * mixed together (using bit shifting) with a index value which tells the starting index value
   * of where the multi style entries begin.
   */
  [StylingIndex.MasterFlagPosition]: number;

  /**
   * Location of the collection of directives for this context
   */
  [StylingIndex.DirectiveRegistryPosition]: DirectiveRegistryValues;

  /**
   * Location of all static styles values
   */
  [StylingIndex.InitialStyleValuesPosition]: InitialStylingValues;

  /**
   * Location of all static class values
   */
  [StylingIndex.InitialClassValuesPosition]: InitialStylingValues;

  /**
   * A numeric value representing the class index offset value. Whenever a single class is
   * applied (using `elementClassProp`) it should have an styling index value that doesn't
   * need to take into account any style values that exist in the context.
   */
  [StylingIndex.SinglePropOffsetPositions]: SinglePropOffsetValues;

  /**
   * Location of element that is used as a target for this context.
   */
  [StylingIndex.ElementPosition]: RElement|null;

  /**
   * The last class value that was interpreted by elementStylingMap. This is cached
   * So that the algorithm can exit early incase the value has not changed.
   */
  [StylingIndex.CachedClassValueOrInitialClassString]: {[key: string]: any}|string|(string)[]|null;

  /**
   * The last style value that was interpreted by elementStylingMap. This is cached
   * So that the algorithm can exit early incase the value has not changed.
   */
  [StylingIndex.CachedStyleValue]: {[key: string]: any}|(string)[]|null;

  /**
   * Location of animation context (which contains the active players) for this element styling
   * context.
   */
  [StylingIndex.PlayerContext]: PlayerContext|null;
}

/**
 * Used as a styling array to house static class and style values that were extracted
 * by the compiler and placed in the animation context via `elementStart` and
 * `elementHostAttrs`.
 *
 * See [InitialStylingValuesIndex] for a breakdown of how all this works.
 */
export interface InitialStylingValues extends Array<string|boolean|null> { [0]: null; }

/**
 * Used as an offset/position index to figure out where initial styling
 * values are located.
 *
 * Used as a reference point to provide markers to all static styling
 * values (the initial style and class values on an element) within an
 * array within the StylingContext. This array contains key/value pairs
 * where the key is the style property name or className and the value is
 * the style value or whether or not a class is present on the elment.
 *
 * The first value is also always null so that a initial index value of
 * `0` will always point to a null value.
 *
 * If a <div> elements contains a list of static styling values like so:
 *
 * <div class="foo bar baz" style="width:100px; height:200px;">
 *
 * Then the initial styles for that will look like so:
 *
 * Styles:
 * StylingContext[InitialStylesIndex] = [
 *   null, 'width', '100px', height, '200px'
 * ]
 *
 * Classes:
 * StylingContext[InitialStylesIndex] = [
 *   null, 'foo', true, 'bar', true, 'baz', true
 * ]
 *
 * Initial style and class entries have their own arrays. This is because
 * it's easier to add to the end of one array and not then have to update
 * every context entries' pointer index to the newly offseted values.
 *
 * When property bindinds are added to a context then initial style/class
 * values will also be inserted into the array. This is to create a space
 * in the situation when a follow-up directive inserts static styling into
 * the array. By default style values are `null` and class values are
 * `false` when inserted by property bindings.
 *
 * For example:
 * <div class="foo bar baz"
 *      [class.car]="myCarExp"
 *      style="width:100px; height:200px;"
 *      [style.opacity]="myOpacityExp">
 *
 * Will construct initial styling values that look like:
 *
 * Styles:
 * StylingContext[InitialStylesIndex] = [
 *   null, 'width', '100px', height, '200px', 'opacity', null
 * ]
 *
 * Classes:
 * StylingContext[InitialStylesIndex] = [
 *   null, 'foo', true, 'bar', true, 'baz', true, 'car', false
 * ]
 *
 * Now if a directive comes along and introduces `car` as a static
 * class value or `opacity` then those values will be filled into
 * the initial styles array.
 *
 * For example:
 *
 * @Directive({
 *   selector: 'opacity-car-directive',
 *   host: {
 *     'style': 'opacity:0.5',
 *     'class': 'car'
 *   }
 * })
 * class OpacityCarDirective {}
 *
 * This will render itself as:
 *
 * Styles:
 * StylingContext[InitialStylesIndex] = [
 *   null, 'width', '100px', height, '200px', 'opacity', null
 * ]
 *
 * Classes:
 * StylingContext[InitialStylesIndex] = [
 *   null, 'foo', true, 'bar', true, 'baz', true, 'car', false
 * ]
 */
export const enum InitialStylingValuesIndex {
  KeyValueStartPosition = 1,
  PropOffset = 0,
  ValueOffset = 1,
  Size = 2
}

/**
 * An array located in the StylingContext that houses all directive instances and additional
 * data about them.
 *
 * Each entry in this array represents a source of where style/class binding values could
 * come from. By default, there is always at least one directive here with a null value and
 * that represents bindings that live directly on an element (not host bindings).
 *
 * Each successive entry in the array is an actual instance of an array as well as some
 * additional info.
 *
 * An entry within this array has the following values:
 * [0] = The instance of the directive (or null when it is not a directive, but a template binding
 * source)
 * [1] = The pointer that tells where the single styling (stuff like [class.foo] and [style.prop])
 *       offset values are located. This value will allow for a binding instruction to find exactly
 *       where a style is located.
 * [2] = Whether or not the directive has any styling values that are dirty. This is used as
 *       reference within the renderClassAndStyleBindings function to decide whether to skip
 *       iterating through the context when rendering is executed.
 * [3] = The styleSanitizer instance that is assigned to the directive. Although it's unlikely,
 *       a directive could introduce its own special style sanitizer and for this reach each
 *       directive will get its own space for it (if null then the very first sanitizer is used).
 *
 * Each time a new directive is added it will insert these four values at the end of the array.
 * When this array is examined (using indexOf) then the resulting directiveIndex will be resolved
 * by dividing the index value by the size of the array entries (so if DirA is at spot 8 then its
 * index will be 2).
 */
export interface DirectiveRegistryValues extends Array<null|{}|boolean|number|StyleSanitizeFn> {
  [DirectiveRegistryValuesIndex.DirectiveValueOffset]: null;
  [DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset]: number;
  [DirectiveRegistryValuesIndex.DirtyFlagOffset]: boolean;
  [DirectiveRegistryValuesIndex.StyleSanitizerOffset]: StyleSanitizeFn|null;
}

/**
 * An enum that outlines the offset/position values for each directive entry and its data
 * that are housed inside of [DirectiveRegistryValues].
 */
export const enum DirectiveRegistryValuesIndex {
  DirectiveValueOffset = 0,
  SinglePropValuesIndexOffset = 1,
  DirtyFlagOffset = 2,
  StyleSanitizerOffset = 3,
  Size = 4
}

/**
 * An array that contains the index pointer values for every single styling property
 * that exists in the context and for every directive. It also contains the total
 * single styles and single classes that exists in the context as the first two values.
 *
 * Let's say we have the following template code:
 *
 * <div [style.width]="myWidth"
 *      [style.height]="myHeight"
 *      [class.flipped]="flipClass"
 *      directive-with-opacity>
 *      directive-with-foo-bar-classes>
 *
 * We have two directive and template-binding sources,
 * 2 + 1 styles and 1 + 1 classes. When the bindings are
 * registered the SinglePropOffsets array will look like so:
 *
 * s_0/c_0 = template directive value
 * s_1/c_1 = directive one (directive-with-opacity)
 * s_2/c_2 = directive two (directive-with-foo-bar-classes)
 *
 * [3, 2, 2, 1, s_00, s01, c_01, 1, 0, s_10, 0, 1, c_20
 */
export interface SinglePropOffsetValues extends Array<number> {
  [SinglePropOffsetValuesIndex.StylesCountPosition]: number;
  [SinglePropOffsetValuesIndex.ClassesCountPosition]: number;
}

/**
 * An enum that outlines the offset/position values for each single prop/class entry
 * that are housed inside of [SinglePropOffsetValues].
 */
export const enum SinglePropOffsetValuesIndex {
  StylesCountPosition = 0,
  ClassesCountPosition = 1,
  ValueStartPosition = 2
}

/**
 * Used to set the context to be dirty or not both on the master flag (position 1)
 * or for each single/multi property that exists in the context.
 */
export const enum StylingFlags {
  // Implies no configurations
  None = 0b000000,
  // Whether or not the entry or context itself is dirty
  Dirty = 0b000001,
  // Whether or not this is a class-based assignment
  Class = 0b000010,
  // Whether or not a sanitizer was applied to this property
  Sanitize = 0b000100,
  // Whether or not any player builders within need to produce new players
  PlayerBuildersDirty = 0b001000,
  // If NgClass is present (or some other class handler) then it will handle the map expressions and
  // initial classes
  OnlyProcessSingleClasses = 0b010000,
  // The max amount of bits used to represent these configuration values
  BindingAllocationLocked = 0b100000,
  BitCountSize = 6,
  // There are only six bits here
  BitMask = 0b111111
}

/** Used as numeric pointer values to determine what cells to update in the `StylingContext` */
export const enum StylingIndex {
  // Index of location where the start of single properties are stored. (`updateStyleProp`)
  MasterFlagPosition = 0,
  // Position of where the registered directives exist for this styling context
  DirectiveRegistryPosition = 1,
  // Position of where the initial styles are stored in the styling context
  InitialStyleValuesPosition = 2,
  InitialClassValuesPosition = 3,
  // Index of location where the class index offset value is located
  SinglePropOffsetPositions = 4,
  // Position of where the initial styles are stored in the styling context
  // This index must align with HOST, see interfaces/view.ts
  ElementPosition = 5,
  // Position of where the last string-based CSS class value was stored (or a cached version of the
  // initial styles when a [class] directive is present)
  CachedClassValueOrInitialClassString = 6,
  // Position of where the last string-based CSS class value was stored
  CachedStyleValue = 7,
  // Multi and single entries are stored in `StylingContext` as: Flag; PropertyName;  PropertyValue
  // Position of where the initial styles are stored in the styling context
  PlayerContext = 8,
  // Location of single (prop) value entries are stored within the context
  SingleStylesStartPosition = 9,
  FlagsOffset = 0,
  PropertyOffset = 1,
  ValueOffset = 2,
  PlayerBuilderIndexOffset = 3,
  // Size of each multi or single entry (flag + prop + value + playerBuilderIndex)
  Size = 4,
  // Each flag has a binary digit length of this value
  BitCountSize = 14,  // (32 - 4) / 2 = ~14
  // The binary digit value as a mask
  BitMask = 0b11111111111111,  // 14 bits
}

/**
 * An enum that outlines the bit flag data for directive owner and player index
 * values that exist within en entry that lives in the StylingContext.
 *
 * The values here split a number value into two sets of bits:
 *  - The first 16 bits are used to store the directiveIndex that owns this style value
 *  - The other 16 bits are used to store the playerBuilderIndex that is attached to this style
 */
export const enum DirectiveOwnerAndPlayerBuilderIndex {
  BitCountSize = 16,
  BitMask = 0b1111111111111111
}
