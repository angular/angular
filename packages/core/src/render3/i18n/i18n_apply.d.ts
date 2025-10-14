/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { I18nCreateOpCodes, I18nUpdateOpCodes, IcuCreateOpCodes } from '../interfaces/i18n';
import { RElement, RNode } from '../interfaces/renderer_dom';
import { LView, TView } from '../interfaces/view';
/**
 * Keep track of which input bindings in `ɵɵi18nExp` have changed.
 *
 * `setMaskBit` gets invoked by each call to `ɵɵi18nExp`.
 *
 * @param hasChange did `ɵɵi18nExp` detect a change.
 */
export declare function setMaskBit(hasChange: boolean): void;
export declare function applyI18n(tView: TView, lView: LView, index: number): void;
export declare function enableLocateOrCreateI18nNodeImpl(): void;
/**
 * Apply `I18nCreateOpCodes` op-codes as stored in `TI18n.create`.
 *
 * Creates text (and comment) nodes which are internationalized.
 *
 * @param lView Current lView
 * @param createOpCodes Set of op-codes to apply
 * @param parentRNode Parent node (so that direct children can be added eagerly) or `null` if it is
 *     a root node.
 * @param insertInFrontOf DOM node that should be used as an anchor.
 */
export declare function applyCreateOpCodes(lView: LView, createOpCodes: I18nCreateOpCodes, parentRNode: RElement | null, insertInFrontOf: RElement | null): void;
/**
 * Apply `I18nMutateOpCodes` OpCodes.
 *
 * @param tView Current `TView`
 * @param mutableOpCodes Mutable OpCodes to process
 * @param lView Current `LView`
 * @param anchorRNode place where the i18n node should be inserted.
 */
export declare function applyMutableOpCodes(tView: TView, mutableOpCodes: IcuCreateOpCodes, lView: LView, anchorRNode: RNode): void;
/**
 * Apply `I18nUpdateOpCodes` OpCodes
 *
 * @param tView Current `TView`
 * @param lView Current `LView`
 * @param updateOpCodes OpCodes to process
 * @param bindingsStartIndex Location of the first `ɵɵi18nApply`
 * @param changeMask Each bit corresponds to a `ɵɵi18nExp` (Counting backwards from
 *     `bindingsStartIndex`)
 */
export declare function applyUpdateOpCodes(tView: TView, lView: LView, updateOpCodes: I18nUpdateOpCodes, bindingsStartIndex: number, changeMask: number): void;
