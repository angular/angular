/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SanitizerFn} from './sanitization';


/**
 * Stores a list of nodes which need to be removed.
 *
 * Numbers are indexes into the `LView`
 * - index > 0: `removeRNode(lView[0])`
 * - index < 0: `removeICU(~lView[0])`
 */
export interface I18nRemoveOpCodes extends Array<number> {
  __brand__: 'I18nRemoveOpCodes';
}

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
export const enum IcuCreateOpCode {
  /**
   * Stores shift amount for bits 17-3 that contain reference index.
   */
  SHIFT_REF = 1,
  /**
   * Stores shift amount for bits 31-17 that contain parent index.
   */
  SHIFT_PARENT = 17,
  /**
   * Mask for OpCode
   */
  MASK_INSTRUCTION = 0b1,

  /**
   * Mask for the Reference node (bits 16-3)
   */
  MASK_REF = 0b11111111111111110,
  //           11111110000000000
  //           65432109876543210

  /**
   * Instruction to append the current node to `PARENT`.
   */
  AppendChild = 0b0,

  /**
   * Instruction to set the attribute of a node.
   */
  Attr = 0b1,
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
 *   ICU_MARKER, '', 0, 1 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
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
 */
export interface IcuCreateOpCodes extends Array<number|string|ELEMENT_MARKER|ICU_MARKER|null>,
                                          I18nDebug {
  __brand__: 'I18nCreateOpCodes';
}

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
 * Marks that the next string is comment text need for ICU.
 *
 * See `I18nMutateOpCodes` documentation.
 */
export const ICU_MARKER: ICU_MARKER = {
  marker: 'ICU'
};

export interface ICU_MARKER {
  marker: 'ICU';
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
 * Array storing OpCode for dynamically creating `i18n` translation DOM elements.
 *
 * This array creates a sequence of `Text` and `Comment` (as ICU anchor) DOM elements. It consists
 * of a pair of `number` and `string` pairs which encode the operations for the creation of the
 * translated block.
 *
 * The number is shifted and encoded according to `I18nCreateOpCode`
 *
 * Pseudocode:
 * ```
 * const i18nCreateOpCodes = [
 *   10 << I18nCreateOpCode.SHIFT, "Text Node add to DOM",
 *   11 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.COMMENT, "Comment Node add to DOM",
 *   12 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.APPEND_LATER, "Text Node added later"
 * ];
 *
 * for(var i=0; i<i18nCreateOpCodes.length; i++) {
 *   const opcode = i18NCreateOpCodes[i++];
 *   const index = opcode >> I18nCreateOpCode.SHIFT;
 *   const text = i18NCreateOpCodes[i];
 *   let node: Text|Comment;
 *   if (opcode & I18nCreateOpCode.COMMENT === I18nCreateOpCode.COMMENT) {
 *     node = lView[~index] = document.createComment(text);
 *   } else {
 *     node = lView[index] = document.createText(text);
 *   }
 *   if (opcode & I18nCreateOpCode.APPEND_EAGERLY !== I18nCreateOpCode.APPEND_EAGERLY) {
 *     parentNode.appendChild(node);
 *   }
 * }
 * ```
 */
export interface I18nCreateOpCodes extends Array<number|string>, I18nDebug {
  __brand__: 'I18nCreateOpCodes';
}

/**
 * See `I18nCreateOpCodes`
 */
export enum I18nCreateOpCode {
  /**
   * Number of bits to shift index so that it can be combined with the `APPEND_EAGERLY` and
   * `COMMENT`.
   */
  SHIFT = 2,

  /**
   * Should the node be appended to parent imedditatly after creation.
   */
  APPEND_EAGERLY = 0b01,

  /**
   * If set the node should be comment (rather than a text) node.
   */
  COMMENT = 0b10,
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
export interface I18nUpdateOpCodes extends Array<string|number|SanitizerFn|null>, I18nDebug {
  __brand__: 'I18nUpdateOpCodes';
}

/**
 * Store information for the i18n translation block.
 */
export interface TI18n {
  /**
   * A set of OpCodes which will create the Text Nodes and ICU anchors for the translation blocks.
   *
   * NOTE: The ICU anchors are filled in with ICU Update OpCode.
   */
  create: I18nCreateOpCodes;

  /**
   * A set of OpCodes which will be executed on each change detection to determine if any changes to
   * DOM are required.
   */
  update: I18nUpdateOpCodes;
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
   * Index in `LView` where the anchor node is stored. `<!-- ICU 0:0 -->`
   */
  anchorIdx: number;

  /**
   * Currently selected ICU case pointer.
   *
   * `lView[currentCaseLViewIndex]` stores the currently selected case. This is needed to know how
   * to clean up the current case when transitioning no the new case.
   *
   * If the value stored is:
   * `null`: No current case selected.
   *   `<0`: A flag which means that the ICU just switched and that `icuUpdate` must be executed
   *         regardless of the `mask`. (After the execution the flag is cleared)
   *   `>=0` A currently selected case index.
   */
  currentCaseLViewIndex: number;

  /**
   * A list of case values which the current ICU will try to match.
   *
   * The last value is `other`
   */
  cases: any[];

  /**
   * A set of OpCodes to apply in order to build up the DOM render tree for the ICU
   */
  create: IcuCreateOpCodes[];

  /**
   * A set of OpCodes to apply in order to destroy the DOM render tree for the ICU.
   */
  remove: I18nRemoveOpCodes[];

  /**
   * A set of OpCodes to apply in order to update the DOM render tree for the ICU bindings.
   */
  update: I18nUpdateOpCodes[];
}

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;

/**
 * Parsed ICU expression
 */
export interface IcuExpression {
  type: IcuType;
  mainBinding: number;
  cases: string[];
  values: (string|IcuExpression)[][];
}
