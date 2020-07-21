/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SanitizerFn} from './sanitization';

/**
 * `I18nMutateOpCode` defines OpCodes for `I18nMutateOpCodes` array.
 *
 * OpCodes are efficient operations which can be applied to the DOM to update it. (For example to
 * update to a new ICU case requires that we clean up previous elements and create new ones.)
 *
 * OpCodes contain three parts:
 *  1) Parent node index offset. (p)
 *  2) Reference node index offset. (r)
 *  3) The instruction to execute. (i)
 *
 * pppp pppp pppp pppp rrrr rrrr rrrr riii
 * 3322 2222 2222 1111 1111 1110 0000 0000
 * 1098 7654 3210 9876 5432 1098 7654 3210
 *
 * ```
 * var parent = lView[opCode >>> SHIFT_PARENT];
 * var refNode = lView[((opCode & MASK_REF) >>> SHIFT_REF)];
 * var instruction = opCode & MASK_OPCODE;
 * ```
 *
 * See: `I18nCreateOpCodes` for example of usage.
 */
export const enum I18nMutateOpCode {
  /**
   * Stores shift amount for bits 17-3 that contain reference index.
   */
  SHIFT_REF = 3,
  /**
   * Stores shift amount for bits 31-17 that contain parent index.
   */
  SHIFT_PARENT = 17,
  /**
   * Mask for OpCode
   */
  MASK_INSTRUCTION = 0b111,

  /**
   * Mask for the Reference node (bits 16-3)
   */
  // FIXME(misko): Why is this not used?
  MASK_REF = 0b11111111111111000,
  //           11111110000000000
  //           65432109876543210

  /**
   * Instruction to select a node. (next OpCode will contain the operation.)
   */
  Select = 0b000,

  /**
   * Instruction to append the current node to `PARENT`.
   */
  AppendChild = 0b001,

  /**
   * Instruction to remove the `REF` node from `PARENT`.
   */
  Remove = 0b011,

  /**
   * Instruction to set the attribute of a node.
   */
  Attr = 0b100,

  /**
   * Instruction to simulate elementEnd()
   */
  ElementEnd = 0b101,

  /**
   * Instruction to removed the nested ICU.
   */
  RemoveNestedIcu = 0b110,
}

export function getParentFromI18nMutateOpCode(mergedCode: number): number {
  return mergedCode >>> I18nMutateOpCode.SHIFT_PARENT;
}

export function getRefFromI18nMutateOpCode(mergedCode: number): number {
  return (mergedCode & I18nMutateOpCode.MASK_REF) >>> I18nMutateOpCode.SHIFT_REF;
}

export function getInstructionFromI18nMutateOpCode(mergedCode: number): number {
  return mergedCode & I18nMutateOpCode.MASK_INSTRUCTION;
}

/**
 * Marks that the next string is an element name.
 *
 * See `I18nMutateOpCodes` documentation.
 */
export const ELEMENT_MARKER: ELEMENT_MARKER = {
  marker: 'element'
};
export interface ELEMENT_MARKER {
  marker: 'element';
}

/**
 * Marks that the next string is comment text.
 *
 * See `I18nMutateOpCodes` documentation.
 */
export const COMMENT_MARKER: COMMENT_MARKER = {
  marker: 'comment'
};

export interface COMMENT_MARKER {
  marker: 'comment';
}

export interface I18nDebug {
  /**
   * Human readable representation of the OpCode arrays.
   *
   * NOTE: This property only exists if `ngDevMode` is set to `true` and it is not present in
   * production. Its presence is purely to help debug issue in development, and should not be relied
   * on in production application.
   */
  debug?: string[];
}


/**
 * Array storing OpCode for dynamically creating `i18n` blocks.
 *
 * Example:
 * ```ts
 * <I18nCreateOpCode>[
 *   // For adding text nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   lView[1].appendChild(lView[0] = document.createTextNode('xyz'));
 *   'xyz', 0, 1 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For adding element nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   lView[1].appendChild(lView[0] = document.createElement('div'));
 *   ELEMENT_MARKER, 'div', 0, 1 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For adding comment nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   lView[1].appendChild(lView[0] = document.createComment(''));
 *   COMMENT_MARKER, '', 0, 1 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For moving existing nodes to a different location
 *   // --------------------------------------------------
 *   // Equivalent to:
 *   //   const node = lView[1];
 *   //   lView[2].appendChild(node);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For removing existing nodes
 *   // --------------------------------------------------
 *   //   const node = lView[1];
 *   //   removeChild(tView.data(1), node, lView);
 *   1 << SHIFT_REF | Remove,
 *
 *   // For writing attributes
 *   // --------------------------------------------------
 *   //   const node = lView[1];
 *   //   node.setAttribute('attr', 'value');
 *   1 << SHIFT_REF | Attr, 'attr', 'value'
 * ];
 * ```
 *
 * See: `applyI18nCreateOpCodes`;
 */
export interface I18nMutateOpCodes extends Array<number|string|ELEMENT_MARKER|COMMENT_MARKER|null>,
                                           I18nDebug {}

export const enum I18nUpdateOpCode {
  /**
   * Stores shift amount for bits 17-2 that contain reference index.
   */
  SHIFT_REF = 2,
  /**
   * Mask for OpCode
   */
  MASK_OPCODE = 0b11,

  /**
   * Instruction to update a text node.
   */
  Text = 0b00,
  /**
   * Instruction to update a attribute of a node.
   */
  Attr = 0b01,
  /**
   * Instruction to switch the current ICU case.
   */
  IcuSwitch = 0b10,
  /**
   * Instruction to update the current ICU case.
   */
  IcuUpdate = 0b11,
}

/**
 * Stores DOM operations which need to be applied to update DOM render tree due to changes in
 * expressions.
 *
 * The basic idea is that `i18nExp` OpCodes capture expression changes and update a change
 * mask bit. (Bit 1 for expression 1, bit 2 for expression 2 etc..., bit 32 for expression 32 and
 * higher.) The OpCodes then compare its own change mask against the expression change mask to
 * determine if the OpCodes should execute.
 *
 * NOTE: 32nd bit is special as it says 32nd or higher. This way if we have more than 32 bindings
 * the code still works, but with lower efficiency. (it is unlikely that a translation would have
 * more than 32 bindings.)
 *
 * These OpCodes can be used by both the i18n block as well as ICU sub-block.
 *
 * ## Example
 *
 * Assume
 * ```ts
 *   if (rf & RenderFlags.Update) {
 *    i18nExp(ctx.exp1); // If changed set mask bit 1
 *    i18nExp(ctx.exp2); // If changed set mask bit 2
 *    i18nExp(ctx.exp3); // If changed set mask bit 3
 *    i18nExp(ctx.exp4); // If changed set mask bit 4
 *    i18nApply(0);            // Apply all changes by executing the OpCodes.
 *  }
 * ```
 * We can assume that each call to `i18nExp` sets an internal `changeMask` bit depending on the
 * index of `i18nExp`.
 *
 * ### OpCodes
 * ```ts
 * <I18nUpdateOpCodes>[
 *   // The following OpCodes represent: `<div i18n-title="pre{{exp1}}in{{exp2}}post">`
 *   // If `changeMask & 0b11`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `8` values and start processing next OpCodes.
 *   0b11, 8,
 *   // Concatenate `newValue = 'pre'+lView[bindIndex-4]+'in'+lView[bindIndex-3]+'post';`.
 *   'pre', -4, 'in', -3, 'post',
 *   // Update attribute: `elementAttribute(1, 'title', sanitizerFn(newValue));`
 *   1 << SHIFT_REF | Attr, 'title', sanitizerFn,
 *
 *   // The following OpCodes represent: `<div i18n>Hello {{exp3}}!">`
 *   // If `changeMask & 0b100`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `4` values and start processing next OpCodes.
 *   0b100, 4,
 *   // Concatenate `newValue = 'Hello ' + lView[bindIndex -2] + '!';`.
 *   'Hello ', -2, '!',
 *   // Update text: `lView[1].textContent = newValue;`
 *   1 << SHIFT_REF | Text,
 *
 *   // The following OpCodes represent: `<div i18n>{exp4, plural, ... }">`
 *   // If `changeMask & 0b1000`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `2` values and start processing next OpCodes.
 *   0b1000, 2,
 *   // Concatenate `newValue = lView[bindIndex -1];`.
 *   -1,
 *   // Switch ICU: `icuSwitchCase(lView[1], 0, newValue);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuSwitch,
 *
 *   // Note `changeMask & -1` is always true, so the IcuUpdate will always execute.
 *   -1, 1,
 *   // Update ICU: `icuUpdateCase(lView[1], 0);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuUpdate,
 *
 * ];
 * ```
 *
 */
export interface I18nUpdateOpCodes extends Array<string|number|SanitizerFn|null>, I18nDebug {}

/**
 * Store information for the i18n translation block.
 */
export interface TI18n {
  /**
   * Number of slots to allocate in expando.
   *
   * This is the max number of DOM elements which will be created by this i18n + ICU blocks. When
   * the DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can
   * write into them.
   */
  vars: number;

  /**
   * A set of OpCodes which will create the Text Nodes and ICU anchors for the translation blocks.
   *
   * NOTE: The ICU anchors are filled in with ICU Update OpCode.
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

/**
 * Defines the ICU type of `select` or `plural`
 */
export const enum IcuType {
  select = 0,
  plural = 1,
}

export interface TIcu {
  /**
   * Defines the ICU type of `select` or `plural`
   */
  type: IcuType;

  /**
   * Number of slots to allocate in expando for each case.
   *
   * This is the max number of DOM elements which will be created by this i18n + ICU blocks. When
   * the DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can
   * write into them.
   */
  vars: number[];

  /**
   * An optional array of child/sub ICUs.
   *
   * In case of nested ICUs such as:
   * ```
   * {�0�, plural,
   *   =0 {zero}
   *   other {�0� {�1�, select,
   *                     cat {cats}
   *                     dog {dogs}
   *                     other {animals}
   *                   }!
   *   }
   * }
   * ```
   * When the parent ICU is changing it must clean up child ICUs as well. For this reason it needs
   * to know which child ICUs to run clean up for as well.
   *
   * In the above example this would be:
   * ```ts
   * [
   *   [],   // `=0` has no sub ICUs
   *   [1],  // `other` has one subICU at `1`st index.
   * ]
   * ```
   *
   * The reason why it is Array of Arrays is because first array represents the case, and second
   * represents the child ICUs to clean up. There may be more than one child ICUs per case.
   */
  childIcus: number[][];

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

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
