/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LongestAnimation } from './interfaces';
import { LView } from '../render3/interfaces/view';
import { Renderer } from '../render3/interfaces/renderer';
import { TNode } from '../render3/interfaces/node';
export declare const areAnimationSupported: boolean;
/**
 * Helper function to check if animations are disabled via injection token
 */
export declare function areAnimationsDisabled(lView: LView): boolean;
/**
 * Asserts a value passed in is actually an animation type and not something else
 */
export declare function assertAnimationTypes(value: string | Function, instruction: string): void;
/**
 * Asserts a given native element is an actual Element node and not something like a comment node.
 */
export declare function assertElementNodes(nativeElement: Element, instruction: string): void;
/**
 * trackEnterClasses is necessary in the case of composition where animate.enter
 * is used on the same element in multiple places, like on the element and in a
 * host binding. When removing classes, we need the entire list of animation classes
 * added to properly remove them when the longest animation fires.
 */
export declare function trackEnterClasses(el: HTMLElement, classList: string[], cleanupFns: Function[]): void;
/**
 * Helper function to cleanup enterClassMap data safely
 */
export declare function cleanupEnterClassData(element: HTMLElement): void;
export declare const noOpAnimationComplete: () => void;
export declare const enterClassMap: WeakMap<HTMLElement, {
    classList: string[];
    cleanupFns: Function[];
}>;
export declare const longestAnimations: WeakMap<HTMLElement, LongestAnimation>;
export declare const leavingNodes: WeakMap<TNode, HTMLElement[]>;
/**
 * This actually removes the leaving HTML Element in the TNode
 */
export declare function clearLeavingNodes(tNode: TNode, el: HTMLElement): void;
/**
 * In the case that we have an existing node that's animating away, like when
 * an `@if` toggles quickly, we need to end the animation for the former node
 * and remove it right away to prevent duplicate nodes showing up.
 */
export declare function cancelLeavingNodes(tNode: TNode, lView: LView): void;
/**
 * Tracks the nodes list of nodes that are leaving the DOM so we can cancel any leave animations
 * and remove the node before adding a new entering instance of the DOM node. This prevents
 * duplicates from showing up on screen mid-animation.
 */
export declare function trackLeavingNodes(tNode: TNode, el: HTMLElement): void;
/**
 * Retrieves the list of specified enter animations from the lView
 */
export declare function getLViewEnterAnimations(lView: LView): Function[];
/**
 * Retrieves the list of specified leave animations from the lView
 */
export declare function getLViewLeaveAnimations(lView: LView): Function[];
/**
 * Gets the list of classes from a passed in value
 */
export declare function getClassListFromValue(value: string | Function | string[]): string[] | null;
/**
 * Cancels any running enter animations on a given element to prevent them from interfering
 * with leave animations.
 */
export declare function cancelAnimationsIfRunning(element: HTMLElement, renderer: Renderer): void;
/**
 * Checks if a given element contains the classes is a provided list
 */
export declare function elementHasClassList(element: HTMLElement, classList: string[]): boolean;
/**
 * Determines if the animation or transition event is currently the expected longest animation
 * based on earlier determined data in `longestAnimations`
 *
 * @param event
 * @param nativeElement
 * @returns
 */
export declare function isLongestAnimation(event: AnimationEvent | TransitionEvent, nativeElement: HTMLElement): boolean;
/**
 * Determines if a given tNode is a content projection root node.
 */
export declare function isTNodeContentProjectionRoot(tNode: TNode): boolean;
