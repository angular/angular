/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {RElement} from '../interfaces/renderer';
import {LContainer} from './container';
import {PlayerContext} from './player';
import {LView} from './view';


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
 * <!-- when `myWidthExp=null` then a width of `100px`
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
 * In either case, a styling context will be created and stored within an element's `LViewData`.
 * Once the styling context is created then single and multi properties can be stored within it.
 * For this to happen, the following function needs to be called:
 *
 * `styling` (called with style properties, class properties and a sanitizer + a directive
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
 * be inserted twice into the array (once for single property entries and
 * again for multi property entries).
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
 * property instruction like `styleProp`, `classProp`,
 * `styleMap` or `classMap`) then the values in the context will be updated as
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
 * function needs to be run `stylingApply`.
 *
 * `stylingApply` will run through the context and find each dirty value and render them onto
 * the element. Once complete, all styles/classes will be set to clean. Because of this, the render
 * function will now know not to rerun itself again if called again unless new style/class values
 * have changed.
 *
 * ## Directives
 * Directive style/class values (which are provided through host bindings) are also supported and
 * housed within the same styling context as are template-level style/class properties/bindings
 * So long as they are all assigned to the same element, both directive-level and template-level
 * styling bindings share the same context.
 *
 * Each of the following instructions supports accepting a directive instance as an input parameter:
 *
 * - `elementHostAttrs`
 * - `styling`
 * - `styleProp`
 * - `classProp`
 * - `styleMap`
 * - `classMap`
 * - `stylingApply`
 *
 * Each time a directive value is passed in, it will be converted into an index by examining the
 * directive registry (which lives in the context configuration area). The index is then used
 * to help single style properties figure out where a value is located in the context.
 *
 *
 * ## Single-level styling bindings (`[style.prop]` and `[class.name]`)
 *
 * Both `[style.prop]` and `[class.name]` bindings are run through the `updateStyleProp`
 * and `updateClassProp` functions respectively. They work by examining the provided
 * `offset` value and are able to locate the exact spot in the context where the
 * matching style is located.
 *
 * Both `[style.prop]` and `[class.name]` bindings are able to process these values
 * from directive host bindings. When evaluated (from the host binding function) the
 * `directiveRef` value is then passed in.
 *
 * If two directives or a directive + a template binding both write to the same style/class
 * binding then the styling context code will decide which one wins based on the following
 * rule:
 *
 * 1. If the template binding has a value then it always wins
 * 2. Otherwise whichever first-registered directive that has that value first will win
 *
 * The code example helps make this clear:
 *
 * ```
 * <!--
 * <div [style.width]="myWidth"
 *      [my-width-directive]="'600px'">
 * -->
 *
 * @Directive({
 *  selector: '[my-width-directive']
 * })
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
 * Simply put, whichever directive writes to a value first ends up having ownership of it as
 * long as the template didn't set anything.
 *
 * The way in which the ownership is facilitated is through index value. The earliest directives
 * get the smallest index values (with 0 being reserved for the template element bindings). Each
 * time a value is written from a directive or the template bindings, the value itself gets
 * assigned the directive index value in its data. If another directive writes a value again then
 * its directive index gets compared against the directive index that exists on the element. Only
 * when the new value's directive index is less than the existing directive index then the new
 * value will be written to the context. But, if the existing value is null then the new value is
 * written by the less important directive.
 *
 * Each directive also has its own sanitizer and dirty flags. These values are consumed within the
 * rendering function.
 *
 *
 * ## Multi-level styling bindings (`[style]` and `[class]`)
 *
 * Multi-level styling bindings are treated as less important (less specific) as single-level
 * bindings (things like `[style.prop]` and `[class.name]`).
 *
 * Multi-level bindings are still applied to the context in a similar way as are single level
 * bindings, but this process works by diffing the new multi-level values (which are key/value
 * maps) against the existing set of styles that live in the context. Each time a new map value
 * is detected (via identity check) then it will loop through the values and figure out what
 * has changed and reorder the context array to match the ordering of the keys. This reordering
 * of the context makes sure that follow-up traversals of the context when updated against the
 * key/value map are as close as possible to o(n) (where "n" is the size of the key/value map).
 *
 * If a `directiveRef` value is passed in then the styling algorithm code will take the directive's
 * prioritization index into account and update the values with respect to more important
 * directives. This means that if a value such as `width` is updated in two different `[style]`
 * bindings (say one on the template and another within a directive that sits on the same element)
 * then the algorithm will decide how to update the value based on the following heuristic:
 *
 * 1. If the template binding has a value then it always wins
 * 2. If not then whichever first-registered directive that has that value first will win
 *
 * It will also update the value if it was set to `null` by a previous directive (or the template).
 *
 * Each time a value is updated (or removed) then the context will change shape to better match
 * the ordering of the styling data as well as the ordering of each directive that contains styling
 * data. (See `patchStylingMapIntoContext` inside of class_and_style_bindings.ts to better
 * understand how this works.)
 *
 * ## Rendering
 * The rendering mechanism (when the styling data is applied on screen) occurs via the
 * `stylingApply` function and is designed to run after **all** styling functions have been
 * evaluated. The rendering algorithm will loop over the context and only apply the styles that are
 * flagged as dirty (either because they are new, updated or have been removed via multi or
 * single bindings).
 */
export interface StylingContext extends
    Array<{[key: string]: any}|number|string|boolean|RElement|StyleSanitizeFn|PlayerContext|null> {
  /**
   * Location of element that is used as a target for this context.
   */
  [StylingIndex.ElementPosition]: LContainer|LView|RElement|null;

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
   * applied (using `classProp`) it should have an styling index value that doesn't
   * need to take into account any style values that exist in the context.
   */
  [StylingIndex.SinglePropOffsetPositions]: SinglePropOffsetValues;

  /**
   * The last class value that was interpreted by `styleMap`. This is cached
   * So that the algorithm can exit early incase the value has not changed.
   */
  [StylingIndex.CachedMultiClasses]: any|MapBasedOffsetValues;

  /**
   * The last style value that was interpreted by `classMap`. This is cached
   * So that the algorithm can exit early incase the value has not changed.
   */
  [StylingIndex.CachedMultiStyles]: any|MapBasedOffsetValues;

  /**
   * A queue of all hostStyling instructions.
   *
   * This array (queue) is populated only when host-level styling instructions
   * (e.g. `hostStyleMap` and `hostClassProp`) are used to apply style and
   * class values via host bindings to the host element. Despite these being
   * standard angular instructions, they are not designed to immediately apply
   * their values to the styling context when executed. What happens instead is
   * a queue is constructed and each instruction is populated into the queue.
   * Then, once the style/class values are set to flush (via `stylingApply` or
   * `hostStylingApply`), the queue is flushed and the values are rendered onto
   * the host element.
   */
  [StylingIndex.HostInstructionsQueue]: HostInstructionsQueue|null;

  /**
   * Location of animation context (which contains the active players) for this element styling
   * context.
   */
  [StylingIndex.PlayerContext]: PlayerContext|null;
}

/**
 * A queue of all host-related styling instructions (these are buffered and evaluated just before
 * the styling is applied).
 *
 * This queue is used when any `hostStyling` instructions are executed from the `hostBindings`
 * function. Template-level styling functions (e.g. `styleMap` and `classProp`)
 * do not make use of this queue (they are applied to the styling context immediately).
 *
 * Due to the nature of how components/directives are evaluated, directives (both parent and
 * subclass directives) may not apply their styling at the right time for the styling
 * algorithm code to prioritize them. Therefore, all host-styling instructions are queued up
 * (buffered) into the array below and are automatically sorted in terms of priority. The
 * priority for host-styling is as follows:
 *
 * 1. The template (this doesn't get queued, but gets evaluated immediately)
 * 2. Any directives present on the host
 *   2a) first child directive styling bindings are updated
 *   2b) then any parent directives
 * 3. Component host bindings
 *
 * Angular runs change detection for each of these cases in a different order. Because of this
 * the array below is populated with each of the host styling functions + their arguments.
 *
 * context[HostInstructionsQueue] = [
 *   directiveIndex,
 *   hostStylingFn,
 *   [argumentsForFn],
 *   ...
 *   anotherDirectiveIndex, <-- this has a lower priority (a higher directive index)
 *   anotherHostStylingFn,
 *   [argumentsForFn],
 * ]
 *
 * When `renderStyling` is called (within `class_and_host_bindings.ts`) then the queue is
 * drained and each of the instructions are executed. Once complete the queue is empty then
 * the style/class binding code is rendered on the element (which is what happens normally
 * inside of `renderStyling`).
 *
 * Right now each directive's hostBindings function, as well the template function, both
 * call `stylingApply()` and `hostStylingApply()`. The fact that this is called
 * multiple times for the same element (b/c of change detection) causes some issues. To avoid
 * having styling code be rendered on an element multiple times, the `HostInstructionsQueue`
 * reserves a slot for a reference pointing to the very last directive that was registered and
 * only allows for styling to be applied once that directive is encountered (which will happen
 * as the last update for that element).
 */
export interface HostInstructionsQueue extends Array<number|Function|any[]> { [0]: number; }

/**
 * Used as a reference for any values contained within `HostInstructionsQueue`.
 */
export const enum HostInstructionsQueueIndex {
  LastRegisteredDirectiveIndexPosition = 0,
  ValuesStartPosition = 1,
  DirectiveIndexOffset = 0,
  InstructionFnOffset = 1,
  ParamsOffset = 2,
  Size = 3,
}

/**
 * Used as a styling array to house static class and style values that were extracted
 * by the compiler and placed in the animation context via `elementStart` and
 * `elementHostAttrs`.
 *
 * See [InitialStylingValuesIndex] for a breakdown of how all this works.
 */
export interface InitialStylingValues extends Array<string|boolean|number|null> {
  [InitialStylingValuesIndex.DefaultNullValuePosition]: null;
  [InitialStylingValuesIndex.CachedStringValuePosition]: string|null;
}

/**
 * Used as an offset/position index to figure out where initial styling
 * values are located.
 *
 * Used as a reference point to provide markers to all static styling
 * values (the initial style and class values on an element) within an
 * array within the `StylingContext`. This array contains key/value pairs
 * where the key is the style property name or className and the value is
 * the style value or whether or not a class is present on the elment.
 *
 * The first value is always null so that a initial index value of
 * `0` will always point to a null value.
 *
 * The second value is also always null unless a string-based representation
 * of the styling data was constructed (it gets cached in this slot).
 *
 * If a <div> elements contains a list of static styling values like so:
 *
 * <div class="foo bar baz" style="width:100px; height:200px;">
 *
 * Then the initial styles for that will look like so:
 *
 * Styles:
 * ```
 * StylingContext[InitialStylesIndex] = [
 *   null, null, 'width', '100px', height, '200px'
 * ]
 * ```
 *
 * Classes:
 * ```
 * StylingContext[InitialClassesIndex] = [
 *   null, null, 'foo', true, 'bar', true, 'baz', true
 * ]
 * ```
 *
 * Initial style and class entries have their own arrays. This is because
 * it's easier to add to the end of one array and not then have to update
 * every context entries' pointer index to the newly offseted values.
 *
 * When property bindinds are added to a context then initial style/class
 * values will also be inserted into the array. This is to create a space
 * in the situation when a follow-up directive inserts static styling into
 * the array. By default, style values are `null` and class values are
 * `false` when inserted by property bindings.
 *
 * For example:
 * ```
 * <div class="foo bar baz"
 *      [class.car]="myCarExp"
 *      style="width:100px; height:200px;"
 *      [style.opacity]="myOpacityExp">
 * ```
 *
 * Will construct initial styling values that look like:
 *
 * Styles:
 * ```
 * StylingContext[InitialStylesIndex] = [
 *   null, null, 'width', '100px', height, '200px', 'opacity', null
 * ]
 * ```
 *
 * Classes:
 * ```
 * StylingContext[InitialClassesIndex] = [
 *   null, null, 'foo', true, 'bar', true, 'baz', true, 'car', false
 * ]
 * ```
 *
 * Now if a directive comes along and introduces `car` as a static
 * class value or `opacity` then those values will be filled into
 * the initial styles array.
 *
 * For example:
 *
 * ```
 * @Directive({
 *   selector: 'opacity-car-directive',
 *   host: {
 *     'style': 'opacity:0.5',
 *     'class': 'car'
 *   }
 * })
 * class OpacityCarDirective {}
 * ```
 *
 * This will render itself as:
 *
 * Styles:
 * ```
 * StylingContext[InitialStylesIndex] = [
 *   null, null, 'width', '100px', height, '200px', 'opacity', '0.5'
 * ]
 * ```
 *
 * Classes:
 * ```
 * StylingContext[InitialClassesIndex] = [
 *   null, null, 'foo', true, 'bar', true, 'baz', true, 'car', true
 * ]
 * ```
 */
export const enum InitialStylingValuesIndex {
  /**
   * The first value is always `null` so that `styles[0] == null` for unassigned values
   */
  DefaultNullValuePosition = 0,

  /**
   * Used for non-styling code to examine what the style or className string is:
   * styles: ['width', '100px', 0, 'opacity', null, 0, 'height', '200px', 0]
   *    => initialStyles[CachedStringValuePosition] = 'width:100px;height:200px';
   * classes: ['foo', true, 0, 'bar', false, 0, 'baz', true, 0]
   *    => initialClasses[CachedStringValuePosition] = 'foo bar';
   *
   * Note that this value is `null` by default and it will only be populated
   * once `getInitialStyleStringValue` or `getInitialClassNameValue` is executed.
   */
  CachedStringValuePosition = 1,

  /**
   * Where the style or class values start in the tuple
   */
  KeyValueStartPosition = 2,

  /**
   * The offset value (index + offset) for the property value for each style/class entry
   */
  PropOffset = 0,

  /**
   * The offset value (index + offset) for the style/class value for each style/class entry
   */
  ValueOffset = 1,

  /**
   * The offset value (index + offset) for the style/class directive owner for each style/class
     entry
   */
  DirectiveOwnerOffset = 2,

  /**
   * The first bit set aside to mark if the initial style was already rendere
   */
  AppliedFlagBitPosition = 0b0,
  AppliedFlagBitLength = 1,

  /**
   * The total size for each style/class entry (prop + value + directiveOwner)
   */
  Size = 3
}

/**
 * An array located in the StylingContext that houses all directive instances and additional
 * data about them.
 *
 * Each entry in this array represents a source of where style/class binding values could
 * come from. By default, there is always at least one directive here with a null value and
 * that represents bindings that live directly on an element in the template (not host bindings).
 *
 * Each successive entry in the array is an actual instance of a directive as well as some
 * additional info about that entry.
 *
 * An entry within this array has the following values:
 * [0] = The instance of the directive (the first entry is null because its reserved for the
 *       template)
 * [1] = The pointer that tells where the single styling (stuff like [class.foo] and [style.prop])
 *       offset values are located. This value will allow for a binding instruction to find exactly
 *       where a style is located.
 * [2] = Whether or not the directive has any styling values that are dirty. This is used as
 *       reference within the `renderStyling` function to decide whether to skip iterating
 *       through the context when rendering is executed.
 * [3] = The styleSanitizer instance that is assigned to the directive. Although it's unlikely,
 *       a directive could introduce its own special style sanitizer and for this reach each
 *       directive will get its own space for it (if null then the very first sanitizer is used).
 *
 * Each time a new directive is added it will insert these four values at the end of the array.
 * When this array is examined then the resulting directiveIndex will be resolved by dividing the
 * index value by the size of the array entries (so if DirA is at spot 8 then its index will be 2).
 */
export interface DirectiveRegistryValues extends Array<null|{}|boolean|number|StyleSanitizeFn> {
  [DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset]: number;
  [DirectiveRegistryValuesIndex.StyleSanitizerOffset]: StyleSanitizeFn|null;
}

/**
 * An enum that outlines the offset/position values for each directive entry and its data
 * that are housed inside of [DirectiveRegistryValues].
 */
export const enum DirectiveRegistryValuesIndex {
  SinglePropValuesIndexOffset = 0,
  StyleSanitizerOffset = 1,
  Size = 2
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
 * Used a reference for all multi styling values (values that are assigned via the
 * `[style]` and `[class]` bindings).
 *
 * Single-styling properties (things set via `[style.prop]` and `[class.name]` bindings)
 * are not handled using the same approach as multi-styling bindings (such as `[style]`
 * `[class]` bindings).
 *
 * Multi-styling bindings rely on a diffing algorithm to figure out what properties have been added,
 * removed and modified. Multi-styling properties are also evaluated across directives--which means
 * that Angular supports having multiple directives all write to the same `[style]` and `[class]`
 * bindings (using host bindings) even if the `[style]` and/or `[class]` bindings are being written
 * to on the template element.
 *
 * All multi-styling values that are written to an element (whether it be from the template or any
 * directives attached to the element) are all written into the `MapBasedOffsetValues` array. (Note
 * that there are two arrays: one for styles and another for classes.)
 *
 * This array is shaped in the following way:
 *
 * [0]  = The total amount of unique multi-style or multi-class entries that exist currently in the
 *        context.
 * [1+] = Contains an entry of four values ... Each entry is a value assigned by a
 * `[style]`/`[class]`
 *        binding (we call this a **source**).
 *
 *        An example entry looks like so (at a given `i` index):
 *        [i + 0] = Whether or not the value is dirty
 *
 *        [i + 1] = The index of where the map-based values
 *                  (for this **source**) start within the context
 *
 *        [i + 2] = The untouched, last set value of the binding
 *
 *        [i + 3] = The total amount of unqiue binding values that were
 *                  extracted and set into the context. (Note that this value does
 *                  not reflect the total amount of values within the binding
 *                  value (since it's a map), but instead reflects the total values
 *                  that were not used by another directive).
 *
 * Each time a directive (or template) writes a value to a `[class]`/`[style]` binding then the
 * styling diffing algorithm code will decide whether or not to update the value based on the
 * following rules:
 *
 * 1. If a more important directive (either the template or a directive that was registered
 *    beforehand) has written a specific styling value into the context then any follow-up styling
 *    values (set by another directive via its `[style]` and/or `[class]` host binding) will not be
 *    able to set it. This is because the former directive has priorty.
 * 2. Only if a former directive has set a specific styling value to null (whether by actually
 *    setting it to null or not including it in is map value) then a less imporatant directive can
 *    set its own value.
 *
 * ## How the map-based styling algorithm updates itself
 */
export interface MapBasedOffsetValues extends Array<any> {
  [MapBasedOffsetValuesIndex.EntriesCountPosition]: number;
}

export const enum MapBasedOffsetValuesIndex {
  EntriesCountPosition = 0,
  ValuesStartPosition = 1,
  DirtyFlagOffset = 0,
  PositionStartOffset = 1,
  ValueOffset = 2,
  ValueCountOffset = 3,
  Size = 4
}

/**
 * Used to set the context to be dirty or not both on the master flag (position 1)
 * or for each single/multi property that exists in the context.
 */
export const enum StylingFlags {
  // Implies no configurations
  None = 0b00000,
  // Whether or not the entry or context itself is dirty
  Dirty = 0b00001,
  // Whether or not this is a class-based assignment
  Class = 0b00010,
  // Whether or not a sanitizer was applied to this property
  Sanitize = 0b00100,
  // Whether or not any player builders within need to produce new players
  PlayerBuildersDirty = 0b01000,
  // The max amount of bits used to represent these configuration values
  BindingAllocationLocked = 0b10000,
  BitCountSize = 5,
  // There are only five bits here
  BitMask = 0b11111
}

/** Used as numeric pointer values to determine what cells to update in the `StylingContext` */
export const enum StylingIndex {
  // Position of where the initial styles are stored in the styling context
  // This index must align with HOST, see interfaces/view.ts
  ElementPosition = 0,
  // Index of location where the start of single properties are stored. (`updateStyleProp`)
  MasterFlagPosition = 1,
  // Position of where the registered directives exist for this styling context
  DirectiveRegistryPosition = 2,
  // Position of where the initial styles are stored in the styling context
  InitialStyleValuesPosition = 3,
  InitialClassValuesPosition = 4,
  // Index of location where the class index offset value is located
  SinglePropOffsetPositions = 5,
  // Position of where the last string-based CSS class value was stored (or a cached version of the
  // initial styles when a [class] directive is present)
  CachedMultiClasses = 6,
  // Position of where the last string-based CSS class value was stored
  CachedMultiStyles = 7,
  // Multi and single entries are stored in `StylingContext` as: Flag; PropertyName;  PropertyValue
  // Position of where the initial styles are stored in the styling context
  HostInstructionsQueue = 8,
  PlayerContext = 9,
  // Location of single (prop) value entries are stored within the context
  SingleStylesStartPosition = 10,
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

/**
 * The default directive styling index value for template-based bindings.
 *
 * All host-level bindings (e.g. `hostStyleProp` and `hostClassMap`) are
 * assigned a directive styling index value based on the current directive
 * uniqueId and the directive super-class inheritance depth. But for template
 * bindings they always have the same directive styling index value.
 */
export const DEFAULT_TEMPLATE_DIRECTIVE_INDEX = 0;
