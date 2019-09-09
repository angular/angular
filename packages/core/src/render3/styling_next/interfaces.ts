/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {ProceduralRenderer3, RElement, Renderer3} from '../interfaces/renderer';
import {LView} from '../interfaces/view';

/**
 * --------
 *
 * This file contains the core interfaces for styling in Angular.
 *
 * To learn more about the algorithm see `TStylingContext`.
 *
 * --------
 */

/**
 * A static-level representation of all style or class bindings/values
 * associated with a `TNode`.
 *
 * The `TStylingContext` unites all template styling bindings (i.e.
 * `[class]` and `[style]` bindings) as well as all host-level
 * styling bindings (for components and directives) together into
 * a single manifest
 *
 * The styling context is stored on a `TNode` on and there are
 * two instances of it: one for classes and another for styles.
 *
 * ```typescript
 * tNode.styles = [ ... a context only for styles ... ];
 * tNode.classes = [ ... a context only for classes ... ];
 * ```
 *
 * The styling context is created each time there are one or more
 * styling bindings (style or class bindings) present for an element,
 * but is only created once per `TNode`.
 *
 * `tNode.styles` and `tNode.classes` can be an instance of the following:
 *
 * ```typescript
 * tNode.styles = null; // no static styling or styling bindings active
 * tNode.styles = StylingMapArray; // only static values present (e.g. `<div style="width:200">`)
 * tNode.styles = TStylingContext; // one or more styling bindings present (e.g. `<div
 * [style.width]>`)
 * ```
 *
 * Both `tNode.styles` and `tNode.classes` are instantiated when anything
 * styling-related is active on an element. They are first created from
 * from the any of the element-level instructions (e.g. `element`,
 * `elementStart`, `elementHostAttrs`). When any static style/class
 * values are encountered they are registered on the `tNode.styles`
 * and `tNode.classes` data-structures. By default (when any static
 * values are encountered) the `tNode.styles` or `tNode.classes` values
 * are instances of a `StylingMapArray`. Only when style/class bindings
 * are detected then that styling map is converted into an instance of
 * `TStylingContext`.
 *
 * Due to the fact the the `TStylingContext` is stored on a `TNode`
 * this means that all data within the context is static. Instead of
 * storing actual styling binding values, the lView binding index values
 * are stored within the context. (static nature means it is more compact.)
 *
 * The code below shows a breakdown of two instances of `TStylingContext`
 * (one for `tNode.styles` and another for `tNode.classes`):
 *
 * ```typescript
 * // <div [class.active]="c"  // lView binding index = 20
 * //      [style.width]="x"   // lView binding index = 21
 * //      [style.height]="y"> // lView binding index = 22
 * //  ...
 * // </div>
 * tNode.styles = [
 *   0,         // the context config value (see `TStylingContextConfig`)
 *   1,         // the total amount of sources present (only `1` b/c there are only template
 * bindings)
 *   [null],    // initial values array (an instance of `StylingMapArray`)
 *
 *   0,         // config entry for the property (see `TStylingContextPropConfigFlags`)
 *   0b010,     // template guard mask for height
 *   0,         // host bindings guard mask for height
 *   'height',  // the property name
 *   22,        // the binding location for the "y" binding in the lView
 *   null,      // the default value for height
 *
 *   0,         // config entry for the property (see `TStylingContextPropConfigFlags`)
 *   0b001,     // template guard mask for width
 *   0,         // host bindings guard mask for width
 *   'width',   // the property name
 *   21,        // the binding location for the "x" binding in the lView
 *   null,      // the default value for width
 * ];
 *
 * tNode.classes = [
 *   0,         // the context config value (see `TStylingContextConfig`)
 *   1,         // the total amount of sources present (only `1` b/c there are only template
 * bindings)
 *   [null],    // initial values array (an instance of `StylingMapArray`)
 *
 *   0,         // config entry for the property (see `TStylingContextPropConfigFlags`)
 *   0b001,     // template guard mask for width
 *   0,         // host bindings guard mask for width
 *   'active',  // the property name
 *   20,        // the binding location for the "c" binding in the lView
 *   null,      // the default value for the `active` class
 * ];
 * ```
 *
 * Entry value present in an entry (called a tuple) within the
 * styling context is as follows:
 *
 * ```typescript
 * context = [
 *   //...
 *   configValue,
 *   templateGuardMask,
 *   hostBindingsGuardMask,
 *   propName,
 *   ...bindingIndices...,
 *   defaultValue
 *   //...
 * ];
 * ```
 *
 * Below is a breakdown of each value:
 *
 * - **configValue**:
 *   Property-specific configuration values. The only config setting
 *   that is implemented right now is whether or not to sanitize the
 *   value.
 *
 * - **templateGuardMask**:
 *   A numeric value where each bit represents a binding index
 *   location. Each binding index location is assigned based on
 *   a local counter value that increments each time an instruction
 *   is called:
 *
 * ```
 * <div [style.width]="x"   // binding index = 21 (counter index = 0)
 *      [style.height]="y"> // binding index = 22 (counter index = 1)
 * ```
 *
 *   In the example code above, if the `width` value where to change
 *   then the first bit in the local bit mask value would be flipped
 *   (and the second bit for when `height`).
 *
 *   If and when there are more than 32 binding sources in the context
 *   (more than 32 `[style/class]` bindings) then the bit masking will
 *   overflow and we are left with a situation where a `-1` value will
 *   represent the bit mask. Due to the way that JavaScript handles
 *   negative values, when the bit mask is `-1` then all bits within
 *   that value will be automatically flipped (this is a quick and
 *   efficient way to flip all bits on the mask when a special kind
 *   of caching scenario occurs or when there are more than 32 bindings).
 *
 * - **hostBindingsGuardMask**:
 *   Another instance of a guard mask that is specific to host bindings.
 *   This behaves exactly the same way as does the `templateGuardMask`,
 *   but will not contain any binding information processed in the template.
 *   The reason why there are two instances of guard masks (one for the
 *   template and another for host bindings) is because the template bindings
 *   are processed before host bindings and the state information is not
 *   carried over into the host bindings code. As soon as host bindings are
 *   processed for an element the counter and state-based bit mask values are
 *   set to `0`.
 *
 * ```
 * <div [style.width]="x"   // binding index = 21 (counter index = 0)
 *      [style.height]="y"  // binding index = 22 (counter index = 1)
 *      dir-that-sets-width  // binding index = 30 (counter index = 0)
 *      dir-that-sets-width> // binding index = 31 (counter index = 1)
 * ```
 *
 * - **propName**:
 *   The CSS property name or class name (e.g `width` or `active`).
 *
 * - **bindingIndices...**:
 *   A series of numeric binding values that reflect where in the
 *   lView to find the style/class values associated with the property.
 *   Each value is in order in terms of priority (templates are first,
 *   then directives and then components). When the context is flushed
 *   and the style/class values are applied to the element (this happens
 *   inside of the `stylingApply` instruction) then the flushing code
 *   will keep checking each binding index against the associated lView
 *   to find the first style/class value that is non-null.
 *
 * - **defaultValue**:
 *   This is the default that will always be applied to the element if
 *   and when all other binding sources return a result that is null.
 *   Usually this value is `null` but it can also be a static value that
 *   is intercepted when the tNode is first constructured (e.g.
 *   `<div style="width:200px">` has a default value of `200px` for
 *   the `width` property).
 *
 * Each time a new binding is encountered it is registered into the
 * context. The context then is continually updated until the first
 * styling apply call has been called (which is automatically scheduled
 * to be called once an element exits during change detection). Note that
 * each entry in the context is stored in alphabetical order.
 *
 * Once styling has been flushed for the first time for an element the
 * context will set as locked (this prevents bindings from being added
 * to the context later on).
 *
 * # How Styles/Classes are Rendered
 * Each time a styling instruction (e.g. `[class.name]`, `[style.prop]`,
 * etc...) is executed, the associated `lView` for the view is updated
 * at the current binding location. Also, when this happens, a local
 * counter value is incremented. If the binding value has changed then
 * a local `bitMask` variable is updated with the specific bit based
 * on the counter value.
 *
 * Below is a lightweight example of what happens when a single style
 * property is updated (i.e. `<div [style.prop]="val">`):
 *
 * ```typescript
 * function updateStyleProp(prop: string, value: string) {
 *   const lView = getLView();
 *   const bindingIndex = BINDING_INDEX++;
 *
 *   // update the local counter value
 *   const indexForStyle = stylingState.stylesCount++;
 *   if (lView[bindingIndex] !== value) {
 *     lView[bindingIndex] = value;
 *
 *     // tell the local state that we have updated a style value
 *     // by updating the bit mask
 *     stylingState.bitMaskForStyles |= 1 << indexForStyle;
 *   }
 * }
 * ```
 *
 * Once all the bindings have updated a `bitMask` value will be populated.
 * This `bitMask` value is used in the apply algorithm (which is called
 * context resolution).
 *
 * ## The Apply Algorithm (Context Resolution)
 * As explained above, each time a binding updates its value, the resulting
 * value is stored in the `lView` array. These styling values have yet to
 * be flushed to the element.
 *
 * Once all the styling instructions have been evaluated, then the styling
 * context(s) are flushed to the element. When this happens, the context will
 * be iterated over (property by property) and each binding source will be
 * examined and the first non-null value will be applied to the element.
 *
 * Let's say that we the following template code:
 *
 * ```html
 * <div [style.width]="w1" dir-that-set-width="w2"></div>
 * ```
 *
 * There are two styling bindings in the code above and they both write
 * to the `width` property. When styling is flushed on the element, the
 * algorithm will try and figure out which one of these values to write
 * to the element.
 *
 * In order to figure out which value to apply, the following
 * binding prioritization is adhered to:
 *
 *   1. First template-level styling bindings are applied (if present).
 *      This includes things like `[style.width]` and `[class.active]`.
 *
 *   2. Second are styling-level host bindings present in directives.
 *      (if there are sub/super directives present then the sub directives
 *      are applied first).
 *
 *   3. Third are styling-level host bindings present in components.
 *      (if there are sub/super components present then the sub directives
 *      are applied first).
 *
 * This means that in the code above the styling binding present in the
 * template is applied first and, only if its falsy, then the directive
 * styling binding for width will be applied.
 *
 * ### What about map-based styling bindings?
 * Map-based styling bindings are activated when there are one or more
 * `[style]` and/or `[class]` bindings present on an element. When this
 * code is activated, the apply algorithm will iterate over each map
 * entry and apply each styling value to the element with the same
 * prioritization rules as above.
 *
 * For the algorithm to apply styling values efficiently, the
 * styling map entries must be applied in sync (property by property)
 * with prop-based bindings. (The map-based algorithm is described
 * more inside of the `render3/styling_next/map_based_bindings.ts` file.)
 *
 * ## Sanitization
 * Sanitization is used to prevent invalid style values from being applied to
 * the element.
 *
 * It is enabled in two cases:
 *
 *   1. The `styleSanitizer(sanitizerFn)` instruction was called (just before any other
 *      styling instructions are run).
 *
 *   2. The component/directive `LView` instance has a sanitizer object attached to it
 *      (this happens when `renderComponent` is executed with a `sanitizer` value or
 *      if the ngModule contains a sanitizer provider attached to it).
 *
 * If and when sanitization is active then all property/value entries will be evaluated
 * through the active sanitizer before they are applied to the element (or the styling
 * debug handler).
 *
 * If a `Sanitizer` object is used (via the `LView[SANITIZER]` value) then that object
 * will be used for every property.
 *
 * If a `StyleSanitizerFn` function is used (via the `styleSanitizer`) then it will be
 * called in two ways:
 *
 *   1. property validation mode: this will be called early to mark whether a property
 *      should be sanitized or not at during the flushing stage.
 *
 *   2. value sanitization mode: this will be called during the flushing stage and will
 *      run the sanitizer function against the value before applying it to the element.
 *
 * If sanitization returns an empty value then that empty value will be applied
 * to the element.
 */
export interface TStylingContext extends
    Array<number|string|number|boolean|null|StylingMapArray|{}> {
  /** Configuration data for the context */
  [TStylingContextIndex.ConfigPosition]: TStylingConfig;

  /** The total amount of sources present in the context */
  [TStylingContextIndex.TotalSourcesPosition]: number;

  /** Initial value position for static styles */
  [TStylingContextIndex.InitialStylingValuePosition]: StylingMapArray;
}

/**
 * A series of flags used to configure the config value present within an instance of
 * `TStylingContext`.
 */
export const enum TStylingConfig {
  /**
   * The initial state of the styling context config.
   */
  Initial = 0b0000000,

  /**
   * Whether or not there are prop-based bindings present.
   *
   * Examples include:
   * 1. `<div [style.prop]="x">`
   * 2. `<div [class.prop]="x">`
   * 3. `@HostBinding('style.prop') x`
   * 4. `@HostBinding('class.prop') x`
   */
  HasPropBindings = 0b0000001,

  /**
   * Whether or not there are map-based bindings present.
   *
   * Examples include:
   * 1. `<div [style]="x">`
   * 2. `<div [class]="x">`
   * 3. `@HostBinding('style') x`
   * 4. `@HostBinding('class') x`
   */
  HasMapBindings = 0b0000010,

  /**
   * Whether or not there are map-based and prop-based bindings present.
   *
   * Examples include:
   * 1. `<div [style]="x" [style.prop]="y">`
   * 2. `<div [class]="x" [style.prop]="y">`
   * 3. `<div [style]="x" dir-that-sets-some-prop>`
   * 4. `<div [class]="x" dir-that-sets-some-class>`
   */
  HasPropAndMapBindings = 0b0000011,

  /**
   * Whether or not there are two or more sources for a single property in the context.
   *
   * Examples include:
   * 1. prop + prop: `<div [style.width]="x" dir-that-sets-width>`
   * 2. map + prop: `<div [style]="x" [style.prop]>`
   * 3. map + map: `<div [style]="x" dir-that-sets-style>`
   */
  HasCollisions = 0b0000100,

  /**
   * Whether or not the context contains initial styling values.
   *
   * Examples include:
   * 1. `<div style="width:200px">`
   * 2. `<div class="one two three">`
   * 3. `@Directive({ host: { 'style': 'width:200px' } })`
   * 4. `@Directive({ host: { 'class': 'one two three' } })`
   */
  HasInitialStyling = 0b00001000,

  /**
   * Whether or not the context contains one or more template bindings.
   *
   * Examples include:
   * 1. `<div [style]="x">`
   * 2. `<div [style.width]="x">`
   * 3. `<div [class]="x">`
   * 4. `<div [class.name]="x">`
   */
  HasTemplateBindings = 0b00010000,

  /**
   * Whether or not the context contains one or more host bindings.
   *
   * Examples include:
   * 1. `@HostBinding('style') x`
   * 2. `@HostBinding('style.width') x`
   * 3. `@HostBinding('class') x`
   * 4. `@HostBinding('class.name') x`
   */
  HasHostBindings = 0b00100000,

  /**
   * Whether or not the template bindings are allowed to be registered in the context.
   *
   * This flag is after one or more template-based style/class bindings were
   * set and processed for an element. Once the bindings are processed then a call
   * to stylingApply is issued and the lock will be put into place.
   *
   * Note that this is only set once.
   */
  TemplateBindingsLocked = 0b01000000,

  /**
   * Whether or not the host bindings are allowed to be registered in the context.
   *
   * This flag is after one or more host-based style/class bindings were
   * set and processed for an element. Once the bindings are processed then a call
   * to stylingApply is issued and the lock will be put into place.
   *
   * Note that this is only set once.
   */
  HostBindingsLocked = 0b10000000,

  /** A Mask of all the configurations */
  Mask = 0b11111111,

  /** Total amount of configuration bits used */
  TotalBits = 8,
}

/**
 * An index of position and offset values used to navigate the `TStylingContext`.
 */
export const enum TStylingContextIndex {
  ConfigPosition = 0,
  TotalSourcesPosition = 1,
  InitialStylingValuePosition = 2,
  ValuesStartPosition = 3,

  // each tuple entry in the context
  // (config, templateBitGuard, hostBindingBitGuard, prop, ...bindings||default-value)
  ConfigOffset = 0,
  TemplateBitGuardOffset = 1,
  HostBindingsBitGuardOffset = 2,
  PropOffset = 3,
  BindingsStartOffset = 4
}

/**
 * A series of flags used for each property entry within the `TStylingContext`.
 */
export const enum TStylingContextPropConfigFlags {
  Default = 0b0,
  SanitizationRequired = 0b1,
  TotalBits = 1,
  Mask = 0b1,
}

/**
 * A function used to apply or remove styling from an element for a given property.
 */
export interface ApplyStylingFn {
  (renderer: Renderer3|ProceduralRenderer3|null, element: RElement, prop: string, value: any,
   bindingIndex?: number|null): void;
}

/**
 * Runtime data type that is used to store binding data referenced from the `TStylingContext`.
 *
 * Because `LView` is just an array with data, there is no reason to
 * special case `LView` everywhere in the styling algorithm. By allowing
 * this data type to be an array that contains various scalar data types,
 * an instance of `LView` doesn't need to be constructed for tests.
 */
export type LStylingData = LView | (string | number | boolean | null)[];

/**
 * Array-based representation of a key/value array.
 *
 * The format of the array is "property", "value", "property2",
 * "value2", etc...
 *
 * The first value in the array is reserved to store the instance
 * of the key/value array that was used to populate the property/
 * value entries that take place in the remainder of the array.
 */
export interface StylingMapArray extends Array<{}|string|number|null> {
  [StylingMapArrayIndex.RawValuePosition]: {}|string|null;
}

/**
 * An index of position and offset points for any data stored within a `StylingMapArray` instance.
 */
export const enum StylingMapArrayIndex {
  /** Where the values start in the array */
  ValuesStartPosition = 1,

  /** The location of the raw key/value map instance used last to populate the array entries */
  RawValuePosition = 0,

  /** The size of each property/value entry */
  TupleSize = 2,

  /** The offset for the property entry in the tuple */
  PropOffset = 0,

  /** The offset for the value entry in the tuple */
  ValueOffset = 1,
}

/**
 * Used to apply/traverse across all map-based styling entries up to the provided `targetProp`
 * value.
 *
 * When called, each of the map-based `StylingMapArray` entries (which are stored in
 * the provided `LStylingData` array) will be iterated over. Depending on the provided
 * `mode` value, each prop/value entry may be applied or skipped over.
 *
 * If `targetProp` value is provided the iteration code will stop once it reaches
 * the property (if found). Otherwise if the target property is not encountered then
 * it will stop once it reaches the next value that appears alphabetically after it.
 *
 * If a `defaultValue` is provided then it will be applied to the element only if the
 * `targetProp` property value is encountered and the value associated with the target
 * property is `null`. The reason why the `defaultValue` is needed is to avoid having the
 * algorithm apply a `null` value and then apply a default value afterwards (this would
 * end up being two style property writes).
 *
 * @returns whether or not the target property was reached and its value was
 *  applied to the element.
 */
export interface SyncStylingMapsFn {
  (context: TStylingContext, renderer: Renderer3|ProceduralRenderer3|null, element: RElement,
   data: LStylingData, sourceIndex: number, applyStylingFn: ApplyStylingFn,
   sanitizer: StyleSanitizeFn|null, mode: StylingMapsSyncMode, targetProp?: string|null,
   defaultValue?: boolean|string|null): boolean;
}

/**
 * Used to direct how map-based values are applied/traversed when styling is flushed.
 */
export const enum StylingMapsSyncMode {
  /** Only traverse values (no prop/value styling entries get applied) */
  TraverseValues = 0b000,

  /** Apply every prop/value styling entry to the element */
  ApplyAllValues = 0b001,

  /** Only apply the target prop/value entry */
  ApplyTargetProp = 0b010,

  /** Skip applying the target prop/value entry */
  SkipTargetProp = 0b100,

  /** Iterate over inner maps map values in the context */
  RecurseInnerMaps = 0b1000,

  /** Only check to see if a value was set somewhere in each map */
  CheckValuesOnly = 0b10000,
}
