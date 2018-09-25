/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IcuExpression} from './icu';

/**
 * Represents the instructions used to translate the template.
 * Instructions can be a placeholder index, a static text, an ICU instruction or a simple bit field
 * (`I18nInstructions`).
 * When the instruction is the flag `Text`, it is always followed by its text value.
 */
export type I18nInstruction = number | string | IcuExpression;
/**
 * Represents the instructions used to translate attributes containing bindings and ICU expressions.
 * Even indexes contain static strings, while odd indexes contain either the index of the binding
 * whose value will be concatenated into the final translation or an ICU expression.
 */
export type I18nAttrInstruction = number | string | IcuExpression;
/** Mapping of placeholder names to their absolute indexes in their templates. */
export type PlaceholderMap = {
  [name: string]: number
};

/**
 * `I18nMutateOpCode` defines OpCodes for `I18nMutateOpCodes` array.
 *
 * Instructions contain tree parts:
 *  1) Parent node index offset.
 *  2) Reference node index offset.
 *  3) The instruction to execute.
 *
 * See: `I18nCreateOpCodes` for example of usage.
 */
export const enum I18nMutateOpCode {
  /// Stores shift amount for bits 17-2 that contain reference index.
  SHIFT_REF = 2,
  /// Stores shift amount for bits 31-17 that contain parent index.
  SHIFT_PARENT = 17,
  /// Mask for opcode
  MASK_OPCODE = 0b11,
  /// Mask for reference index.
  MASK_REF = ((2 ^ 16) - 1) << SHIFT_REF,

  /// OpCode to select a node. (next OpCode will contain the operation.)
  Select = 0b00,
  /// OpCode to append the current node to `PARENT`.
  AppendChild = 0b01,
  /// OpCode to insert the current node to `PARENT` before `REF`.
  InsertBefore = 0b10,
  /// OpCode to remove the `REF` node from `PARENT`.
  Remove = 0b11,
}

/**
 * Array storing OpCode for dynamically creating `i18n` blocks.
 *
 * Example:
 * ```
 * <I18nCreateOpCode>[
 *   // For adding text nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createText('abc');
 *   //   lViewData[1].insertBefore(node, lViewData[2]);
 *   'abc', 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createText('abc');
 *   //   lViewData[1].appendChild(node);
 *   'xyz', 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For adding anchor nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createComment('');
 *   //   lViewData[1].insertBefore(node, lViewData[2]);
 *   null, 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createComment('');
 *   //   lViewData[1].appendChild(node);
 *   null, 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For moving existing nodes to a different locations
 *   // --------------------------------------------------
 *   // Equivalent to:
 *   //   const node = lViewData[1];
 *   //   lViewData[2].insertBefore(node, lViewData[3]);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | 3 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lViewData[1];
 *   //   lViewData[2].appendChild(node);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | AppendChild,
 *
 *   // For removing existing nodes
 *   // --------------------------------------------------
 *   //   const node = lViewData[1];
 *   //   lViewData[2].remove(node);
 *   2 << SHIFT_PARENT | 1 << SHIFT_REF | Remove,
 *
 *   // For writing attributes
 *   // --------------------------------------------------
 *   //   const node = lViewData[1];
 *   //   node.setAttribute('attr', 'value');
 *   1 << SHIFT_REF | Select, 'attr', 'value' // NOTE: Select followed by two string (vs select
 * followed by OpCode)
 * ];
 * ```
 * NOTE:
 *   - `index` is initial location where the extra nodes should be stored in the EXPANDO section of
 * `LVIewData`.
 *
 * See: `applyI18nCreateOpCodes`;
 */
export interface I18nMutateOpCodes extends Array<number|string|null> {}

export const enum I18nUpdateOpCode {
  /// Stores shift amount for bits 17-2 that contain reference index.
  SHIFT_REF = 2,
  /// Stores shift amount for bits 31-17 that contain which ICU in i18n block are we referring to.
  SHIFT_ICU = 17,
  /// Mask for opcode
  MASK_OPCODE = 0b11,
  /// Mask for reference index.
  MASK_REF = ((2 ^ 16) - 1) << SHIFT_REF,

  /// OpCode to update a text node.
  Text = 0b00,
  /// OpCode to update a attribute of a node.
  Attr = 0b01,
  /// OpCode to switch the current case of ICU.
  IcuSwitch = 0b10,
  /// OpCode to update the current ICU case.
  IcuUpdate = 0b11,
}

/**
 * Stores DOM operations which need to be applied to update DOM render tree due to changes in
 * expressions.
 *
 * The basic idea is that `i18nExp` instructions capture expression changes and update a change
 * mask bit. (Bit 1 for expression 1, bit 2 for expression 2 etc..., bit 32 for expression 32 and
 * higher.) The OpCodes than compare its own change mask against the expression change mask to
 * determine if the OpCodes should execute.
 *
 * These instructions can be used by both the i18n block as well as ICU sub-block.
 *
 * ## Example
 *
 * Assume
 * ```
 *   if (rf & RenderFlags.Update) {
 *    i18nExp(bind(ctx.exp1)); // If changed set mask bit 1
 *    i18nExp(bind(ctx.exp2)); // If changed set mask bit 2
 *    i18nExp(bind(ctx.exp3)); // If changed set mask bit 3
 *    i18nExp(bind(ctx.exp4)); // If changed set mask bit 4
 *    i18nApply(0);            // Apply all changes by executing the OpCodes.
 *  }
 * ```
 * We can assume that each call to `i18nExp` sets an internal `changeMask` bit depending on the
 * index of `i18nExp` index.
 *
 * OpCodes
 * ```
 * <I18nUpdateOpCodes>[
 *   // The following OpCodes represent: `<div i18n-title="pre{{exp1}}in{{exp2}}post">`
 *   // If `changeMask & 0b11`
 *   //        has changed than execute update OpCodes.
 *   //        has NOT change then skip `7` values and start processing next OpCodes.
 *   0b11, 7,
 *   // Concatenate `newValue = 'pre'+lViewData[bindIndex-4]+'in'+lViewData[bindIndex-3]+'post';`.
 *   'pre', -4, 'in', -3, 'post',
 *   // Update attribute: `lViewData[1].setAttribute('title', newValue);`
 *   1 << SHIFT_REF | Attr, 'title',
 *
 *   // The following OpCodes represent: `<div i18n>Hello {{exp3}}!">`
 *   // If `changeMask & 0b100`
 *   //        has changed than execute update OpCodes.
 *   //        has NOT change then skip `4` values and start processing next OpCodes.
 *   0b100, 4,
 *   // Concatenate `newValue = 'Hello ' + lViewData[bindIndex -2] + '!';`.
 *   'Hello ', -2, '!',
 *   // Update text: `lViewData[1].textContent = newValue;`
 *   1 << SHIFT_REF | Text,
 *
 *   // The following OpCodes represent: `<div i18n>{exp4, plural, ... }">`
 *   // If `changeMask & 0b1000`
 *   //        has changed than execute update OpCodes.
 *   //        has NOT change then skip `4` values and start processing next OpCodes.
 *   0b1000, 4,
 *   // Concatenate `newValue = lViewData[bindIndex -1];`.
 *   -1,
 *   // Switch ICU: `icuSwitchCase(lViewData[1], 0, newValue);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuSwitch,
 *
 *   // Note `changeMask & -1` is always true, so the IcuUpdate will always execute.
 *   -1, 1,
 *   // Update ICU: `icuUpdateCase(lViewData[1], 0);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuUpdate,
 *
 * ];
 * ```
 *
 */
interface I18nUpdateOpCodes extends Array<string|number> {}

/**
 * Store information for the i18n translation block.
 */
export interface TI18n {
  /**
   * Number of slots to allocate in expando.
   *
   * This is max number of DOM elements which will be created by this i18n + ICU blocks. When the
   * DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can write
   * into them.
   */
  vars: number;

  /**
   * A set of OpCodes which will create the Text Nodes and ICU anchors for the translation blocks.
   *
   * NOTE: The ICU anchors are filled in with ICU Update instruction.
   */
  create: I18nMutateOpCodes;

  /**
   * A set of OpCodes which will be executed on each change detection to determine if any changes to
   * DOM are required.
   */
  update: I18nUpdateOpCodes;

  /**
   * A list of ICUs in a translation block (or `null` if block has no ICUs).
   *
   * Example:
   * Given: `<div i18n>You have {count, plural, ...} and {state, switch, ...}</div>`
   * There would be 2 ICUs in this array.
   *   1. `{count, plural, ...}`
   *   2. `{state, switch, ...}`
   */
  icus: TIcu[]|null;
}

export interface TIcu {
  /**
   * A list of case values which the current ICU will try to match.
   *
   * The last value is `other`
   */
  cases: any[];

  /**
   * A set of OpCodes to apply in order to build up the DOM render tree for the ICU
   */
  create: I18nMutateOpCodes[];

  /**
   * A set of OpCodes to apply in order to destroy the DOM render tree for the ICU.
   */
  remove: I18nMutateOpCodes[];

  /**
   * A set of OpCodes to apply in order to update the DOM render tree for the ICU bindings.
   */
  update: I18nUpdateOpCodes[];
}

/**
 * Stores currently selected case in each ICU.
 *
 * For each ICU in translation. the `Li18n` store the currently selected case for the current
 * `LView`. For perf reasons this array is only created if a translation block has on ICU.
 */
export interface LI18n extends Array<number> {}
