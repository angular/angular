/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LView } from './interfaces/view';
/** Updates binding and returns the value. */
export declare function updateBinding(lView: LView, bindingIndex: number, value: any): any;
/** Gets the current binding value. */
export declare function getBinding(lView: LView, bindingIndex: number): any;
/**
 * Updates binding if changed, then returns whether it was updated.
 *
 * This function also checks the `CheckNoChangesMode` and throws if changes are made.
 * Some changes (Objects/iterables) during `CheckNoChangesMode` are exempt to comply with VE
 * behavior.
 *
 * @param lView current `LView`
 * @param bindingIndex The binding in the `LView` to check
 * @param value New value to check against `lView[bindingIndex]`
 * @returns `true` if the bindings has changed. (Throws if binding has changed during
 *          `CheckNoChangesMode`)
 */
export declare function bindingUpdated(lView: LView, bindingIndex: number, value: any): boolean;
/** Updates 2 bindings if changed, then returns whether either was updated. */
export declare function bindingUpdated2(lView: LView, bindingIndex: number, exp1: any, exp2: any): boolean;
/** Updates 3 bindings if changed, then returns whether any was updated. */
export declare function bindingUpdated3(lView: LView, bindingIndex: number, exp1: any, exp2: any, exp3: any): boolean;
/** Updates 4 bindings if changed, then returns whether any was updated. */
export declare function bindingUpdated4(lView: LView, bindingIndex: number, exp1: any, exp2: any, exp3: any, exp4: any): boolean;
