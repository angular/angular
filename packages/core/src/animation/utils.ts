/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {stringify} from '../util/stringify'; // Adjust imports as per actual location
import {ANIMATIONS_DISABLED, LongestAnimation} from './interfaces';
import {INJECTOR, LView, DECLARATION_LCONTAINER, ANIMATIONS} from '../render3/interfaces/view';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Renderer} from '../render3/interfaces/renderer';
import {RElement} from '../render3/interfaces/renderer_dom';
import {TNode} from '../render3/interfaces/node';
import {getBeforeNodeForView} from '../render3/node_manipulation';

const DEFAULT_ANIMATIONS_DISABLED = false;

export const areAnimationSupported =
  (typeof ngServerMode === 'undefined' || !ngServerMode) &&
  typeof document !== 'undefined' &&
  // tslint:disable-next-line:no-toplevel-property-access
  typeof document?.documentElement?.getAnimations === 'function';

/**
 * Helper function to check if animations are disabled via injection token
 */
export function areAnimationsDisabled(lView: LView): boolean {
  const injector = lView[INJECTOR]!;
  return injector.get(ANIMATIONS_DISABLED, DEFAULT_ANIMATIONS_DISABLED);
}

/**
 * Asserts a value passed in is actually an animation type and not something else
 */
export function assertAnimationTypes(value: string | Function, instruction: string) {
  if (value == null || (typeof value !== 'string' && typeof value !== 'function')) {
    throw new RuntimeError(
      RuntimeErrorCode.ANIMATE_INVALID_VALUE,
      `'${instruction}' value must be a string of CSS classes or an animation function, got ${stringify(value)}`,
    );
  }
}

/**
 * Asserts a given native element is an actual Element node and not something like a comment node.
 */
export function assertElementNodes(nativeElement: Element, instruction: string) {
  if ((nativeElement as Node).nodeType !== Node.ELEMENT_NODE) {
    throw new RuntimeError(
      RuntimeErrorCode.ANIMATE_INVALID_VALUE,
      `'${instruction}' can only be used on an element node, got ${stringify((nativeElement as Node).nodeType)}`,
    );
  }
}

/**
 * trackEnterClasses is necessary in the case of composition where animate.enter
 * is used on the same element in multiple places, like on the element and in a
 * host binding. When removing classes, we need the entire list of animation classes
 * added to properly remove them when the longest animation fires.
 */
export function trackEnterClasses(el: HTMLElement, classList: string[], cleanupFns: Function[]) {
  const elementData = enterClassMap.get(el);
  if (elementData) {
    for (const klass of classList) {
      elementData.classList.push(klass);
    }
    for (const fn of cleanupFns) {
      elementData.cleanupFns.push(fn);
    }
  } else {
    enterClassMap.set(el, {classList, cleanupFns});
  }
}

/**
 * Helper function to cleanup enterClassMap data safely
 */
export function cleanupEnterClassData(element: HTMLElement): void {
  const elementData = enterClassMap.get(element);
  if (elementData) {
    for (const fn of elementData.cleanupFns) {
      fn();
    }
    enterClassMap.delete(element);
  }
  longestAnimations.delete(element);
}

export const noOpAnimationComplete = () => {};

// Tracks the list of classes added to a DOM node from `animate.enter` calls to ensure
// we remove all of the classes in the case of animation composition via host bindings.
export const enterClassMap = new WeakMap<
  HTMLElement,
  {classList: string[]; cleanupFns: Function[]}
>();
export const longestAnimations = new WeakMap<HTMLElement, LongestAnimation>();

// Tracks nodes that are animating away for the duration of the animation. This is
// used to prevent duplicate nodes from showing up when nodes have been toggled quickly
// from an `@if` or `@for`.
export const leavingNodes = new WeakMap<TNode, HTMLElement[]>();

/**
 * This actually removes the leaving HTML Element in the TNode
 */
export function clearLeavingNodes(tNode: TNode, el: HTMLElement): void {
  const nodes = leavingNodes.get(tNode);
  if (nodes && nodes.length > 0) {
    const ix = nodes.findIndex((node) => node === el);
    if (ix > -1) nodes.splice(ix, 1);
  }
  if (nodes?.length === 0) {
    leavingNodes.delete(tNode);
  }
}

/**
 * In the case that we have an existing node that's animating away, like when
 * an `@if` toggles quickly, we need to end the animation for the former node
 * and remove it right away to prevent duplicate nodes showing up.
 */
export function cancelLeavingNodes(tNode: TNode, lView: LView): void {
  const leavingEl = leavingNodes.get(tNode)?.shift();
  const lContainer = lView[DECLARATION_LCONTAINER];
  if (lContainer) {
    // this is the insertion point for the new TNode element.
    // it will be inserted before the declaring containers anchor.
    const beforeNode = getBeforeNodeForView(tNode.index, lContainer);
    // here we need to check the previous sibling of that anchor. The first
    // previousSibling node will be the new element added. The second
    // previousSibling will be the one that's being removed.
    const previousNode = beforeNode?.previousSibling;
    // We really only want to cancel animations if the leaving node is the
    // same as the node before where the new node will be inserted. This is
    // the control flow scenario where an if was toggled.
    if (leavingEl && previousNode && leavingEl === previousNode) {
      leavingEl.dispatchEvent(new CustomEvent('animationend', {detail: {cancel: true}}));
    }
  }
}

/**
 * Tracks the nodes list of nodes that are leaving the DOM so we can cancel any leave animations
 * and remove the node before adding a new entering instance of the DOM node. This prevents
 * duplicates from showing up on screen mid-animation.
 */
export function trackLeavingNodes(tNode: TNode, el: HTMLElement): void {
  // We need to track this tNode's element just to be sure we don't add
  // a new RNode for this TNode while this one is still animating away.
  // once the animation is complete, we remove this reference.
  if (leavingNodes.has(tNode)) {
    leavingNodes.get(tNode)?.push(el);
  } else {
    leavingNodes.set(tNode, [el]);
  }
}

/**
 * Retrieves the list of specified enter animations from the lView
 */
export function getLViewEnterAnimations(lView: LView): Function[] {
  const animationData = (lView[ANIMATIONS] ??= {});
  return (animationData.enter ??= []);
}

/**
 * Retrieves the list of specified leave animations from the lView
 */
export function getLViewLeaveAnimations(lView: LView): Function[] {
  const animationData = (lView[ANIMATIONS] ??= {});
  return (animationData.leave ??= []);
}

/**
 * Gets the list of classes from a passed in value
 */
export function getClassListFromValue(value: string | Function | string[]): string[] | null {
  const classes = typeof value === 'function' ? value() : value;
  let classList: string[] | null = Array.isArray(classes) ? classes : null;
  if (typeof classes === 'string') {
    classList = classes
      .trim()
      .split(/\s+/)
      .filter((k) => k);
  }
  return classList;
}

/**
 * Cancels any running enter animations on a given element to prevent them from interfering
 * with leave animations.
 */
export function cancelAnimationsIfRunning(element: HTMLElement, renderer: Renderer): void {
  if (!areAnimationSupported) return;
  const elementData = enterClassMap.get(element);
  if (
    elementData &&
    elementData.classList.length > 0 &&
    elementHasClassList(element, elementData.classList)
  ) {
    for (const klass of elementData.classList) {
      renderer.removeClass(element as unknown as RElement, klass);
    }
  }
  // We need to prevent any enter animation listeners from firing if they exist.
  cleanupEnterClassData(element);
}

/**
 * Checks if a given element contains the classes is a provided list
 */
export function elementHasClassList(element: HTMLElement, classList: string[]): boolean {
  for (const className of classList) {
    if (element.classList.contains(className)) return true;
  }
  return false;
}

/**
 * Determines if the animation or transition event is currently the expected longest animation
 * based on earlier determined data in `longestAnimations`
 *
 * @param event
 * @param nativeElement
 * @returns
 */
export function isLongestAnimation(
  event: AnimationEvent | TransitionEvent,
  nativeElement: HTMLElement,
): boolean {
  const longestAnimation = longestAnimations.get(nativeElement);
  return (
    nativeElement === event.target &&
    longestAnimation !== undefined &&
    ((longestAnimation.animationName !== undefined &&
      (event as AnimationEvent).animationName === longestAnimation.animationName) ||
      (longestAnimation.propertyName !== undefined &&
        (event as TransitionEvent).propertyName === longestAnimation.propertyName))
  );
}

/**
 * Determines if a given tNode is a content projection root node.
 */
export function isTNodeContentProjectionRoot(tNode: TNode): boolean {
  return Array.isArray(tNode.projection);
}
