/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AnimationFunction } from '../../animation/interfaces';
import { LView } from '../interfaces/view';
import { TNode } from '../interfaces/node';
/**
 * Instruction to handle the `animate.enter` behavior for class bindings.
 *
 * @param value The value bound to `animate.enter`, which is a string or a function.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵanimateEnter(value: string | Function): typeof ɵɵanimateEnter;
export declare function runEnterAnimation(lView: LView, tNode: TNode, value: string | Function): void;
/**
 * Instruction to handle the `(animate.enter)` behavior for event bindings, aka when
 * a user wants to use a custom animation function rather than a class.
 *
 * @param value The value bound to `(animate.enter)`, an AnimationFunction.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵanimateEnterListener(value: AnimationFunction): typeof ɵɵanimateEnterListener;
/**
 * Instruction to handle the `animate.leave` behavior for class animations.
 * It creates a leave animation function that's tracked in the LView to
 * be run before DOM node removal and cleanup.
 *
 * @param value The value bound to `animate.leave`, which can be a string or a function.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵanimateLeave(value: string | Function): typeof ɵɵanimateLeave;
/**
 * Instruction to handle the `(animate.leave)` behavior for event bindings, aka when
 * a user wants to use a custom animation function rather than a class. It registers
 * a leave animation function in the LView to be run at right before removal from the
 * DOM.
 *
 * @param value The value bound to `(animate.leave)`, an AnimationFunction.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵanimateLeaveListener(value: AnimationFunction): typeof ɵɵanimateLeaveListener;
