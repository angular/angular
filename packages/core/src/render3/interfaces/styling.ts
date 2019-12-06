/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {LView} from './view';


/**
 * --------
 *
 * This file contains the core interfaces for styling in Angular.
 *
 * To learn more about the algorithm see `instructions/styling.ts`.
 *
 * --------
 */

/**
 * Runtime data type that is used to store style/class binding data.
 *
 * Because `LView` is just an array with data, there is no reason to
 * special case `LView` everywhere in the styling algorithm. By allowing
 * this data type to be an array that contains various scalar data types,
 * an instance of `LView` doesn't need to be constructed for tests.
 */
export type LStylingData = LView | (string | number | boolean | null)[];

/**
 * Various flags used for each style/class binding entry stored inside of `TData`.
 */
export const enum TDataStylingFlags {
  /**
   * The initial flag values
   */
  Initial = 0b0000,

  /**
   * Whether or not the binding is a component host binding
   */
  IsComponentHostBinding = 0b0001,

  /**
   * Whether or not the binding is a directive host binding
   */
  IsDirectiveHostBinding = 0b0010,

  /**
   * Whether or not the binding is a directive or component host binding
   */
  IsHostBinding = IsComponentHostBinding | IsDirectiveHostBinding,

  /**
   * Whether or not the binding has a matching binding defined elsewhere in the `tData`.
   *
   * If there are two bindings for an element (e.g. `<div [class.foo] dir-that-sets-foo>`)
   * then the more prioritized binding (in this case `[class.foo]`) will have its configuration
   * marked as it being a duplicate binding. This mechanism is used by the concatenation
   * algorithm to help decide what values to search/replace and what values to append into
   * the final style/class string.
   */
  IsDuplicateBinding = 0b0100,

  /**
   * Whether or not this binding requires sanitization.
   *
   * Note that all map-based style bindings will have this configuration set to true
   * by default. The reason for this is because there is no way to know ahead of time
   * what entries are populated into the map.
   */
  SanitizationRequiredFlag = 0b1000,

  /**
   * All configuration bits set to `1`
   */
  Mask = 0b1111,

  /**
   * Total amount of bits required for the flags.
   *
   * This value must be set to an even value because the remaining bits are partitioned
   * into two parts.
   */
  TotalFlags = 4,
}

/**
 * Various constants used for assigning/reading bits off of the configuration data for a style/class
 * entry in `tData`.
 *
 * When a style/class binding is registered into a `tData` instance, each entry will
 * contain both a property definition and a 32-bit number containing the configuration
 * data and the next/previous index pointer values.
 *
 * The 32-bit number partitions its bit values into the following format:
 *
 * 0000 <= first four bits are for configuration flags (see [TDataStylingFlags])
 * 0000 0000 0000 00 <= next 14 are for the "next bindingIndex" value
 * 0000 0000 0000 00 <= last 14 are for the "previous bindingIndex" value
 *
 * See [binding_registration#registerBindingIntoTData] for more information on how
 * style/class bindings are registered and how the bits are assigned.
 */
export const enum TDataStylingIndex {
  /* tslint:disable */
  TotalBitsForFlags = TDataStylingFlags.TotalFlags,

  /**
   * Total amount of bits for the previous and next binding indices
   */
  TotalBitsPerIndex = (32 - TotalBitsForFlags) / 2,

  /**
   * A bit mask value for the next/previous bindings where all bits are set to `1`
   */
  IndexMask = (1 << TotalBitsPerIndex) - 1,  // -1 flips on all bits before the last one

  /**
   * Total amount of bits before the "next" pointer starts
   */
  TotalBitsBeforeNextIndex = TotalBitsForFlags,

  /**
   * A bit mask value for next binding index where all bits are set to `1`
   */
  NextIndexMask = IndexMask << TotalBitsForFlags,

  /**
   * Total amount of bits before the "previous" pointer starts
   */
  TotalBitsBeforePreviousIndex = TotalBitsBeforeNextIndex + TotalBitsPerIndex,

  /**
   * A bit mask value for previous binding index where all bits are set to `1`
   */
  PreviousIndexMask = IndexMask << TotalBitsBeforePreviousIndex,
}

/**
 * The key/value structure used to store styling information in `TData`.
 *
 * If a binding contains a suffix (e.g. `[style.width.px`]) or if the property
 * is null (i.e. when map-based bindings like `[style]` are used) then this
 * object will be constructed and stored in the `TData` as a representation
 * of that binding.
 *
 * For example:
 * ```html
 * <div [style.width.px]="w" [style.height]="h" [style]="s">
 * ```
 *
 * Is stored as:
 *
 * ```typescript
 * tData = [
 *   //..
 *
 *   {prop: null, suffix: ''}, // [style]
 *   XXXXX,  //config
 *
 *   {prop: 'width', suffix: 'px'}, // [style.width.px]
 *   XXXXX,  //config
 *
 *   'height', // [style.height]
 *   XXXXX,  //config
 *
 *   //..
 * ];
 * ```
 */
export interface TStyleProperty {
  /**
   * The style name or class name property.
   *
   * There are two different types used here for this value:
   * - `string` when a prop-based property is used (e.g. `[style.width]`)
   * - `null` when a map-based property is used (e.g. `[style]`)
   */
  prop: string|null;

  /**
   * The suffix (unit) for the property (e.g. `[style.width.px]` will have `px` as the suffix)
   */
  suffix: string|null;
}
