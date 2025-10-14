/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LView } from '../render3/interfaces/view';
import { LongestAnimation } from './interfaces';
/**
 * Multiple animations can be set on an element. This grabs an element and
 * determines which of those will be the longest duration. If we didn't do
 * this, elements would be removed whenever the first animation completes.
 * This ensures we get the longest running animation and only remove when
 * that animation completes.
 */
export declare function determineLongestAnimation(el: HTMLElement, animationsMap: WeakMap<HTMLElement, LongestAnimation>, areAnimationSupported: boolean): void;
export declare const allLeavingAnimations: Set<LView<unknown>>;
