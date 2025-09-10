/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {stringify} from '../../util/stringify'; // Adjust imports as per actual location
import {
  AnimationCallbackEvent,
  AnimationFunction,
  ANIMATIONS_DISABLED,
  MAX_ANIMATION_TIMEOUT,
  LongestAnimation,
} from '../../animation/interfaces';
import {getLView, getCurrentTNode} from '../state';
import {
  RENDERER,
  INJECTOR,
  CONTEXT,
  LView,
  DECLARATION_LCONTAINER,
  ANIMATIONS,
} from '../interfaces/view';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {getNativeByTNode} from '../util/view_utils';
import {performanceMarkFeature} from '../../util/performance';
import {Renderer} from '../interfaces/renderer';
import {RElement} from '../interfaces/renderer_dom';
import {NgZone} from '../../zone';
import {determineLongestAnimation, allLeavingAnimations} from '../../animation/longest_animation';
import {TNode} from '../interfaces/node';
import {getBeforeNodeForView} from '../node_manipulation';
import type {PromiseConstructor} from '../../util/promise_with_resolvers';

const DEFAULT_ANIMATIONS_DISABLED = false;
const areAnimationSupported =
  (typeof ngServerMode === 'undefined' || !ngServerMode) &&
  typeof document !== 'undefined' &&
  // tslint:disable-next-line:no-toplevel-property-access
  typeof document?.documentElement?.getAnimations === 'function';

/**
 * Helper function to check if animations are disabled via injection token
 */
function areAnimationsDisabled(lView: LView): boolean {
  const injector = lView[INJECTOR]!;
  return injector.get(ANIMATIONS_DISABLED, DEFAULT_ANIMATIONS_DISABLED);
}

/**
 * Helper function to cleanup enterClassMap data safely
 */
function cleanupEnterClassData(element: HTMLElement): void {
  const elementData = enterClassMap.get(element);
  if (elementData) {
    for (const fn of elementData.cleanupFns) {
      fn();
    }
    enterClassMap.delete(element);
  }
  longestAnimations.delete(element);
}

const noOpAnimationComplete = () => {};

// Tracks the list of classes added to a DOM node from `animate.enter` calls to ensure
// we remove all of the classes in the case of animation composition via host bindings.
const enterClassMap = new WeakMap<HTMLElement, {classList: string[]; cleanupFns: Function[]}>();
const longestAnimations = new WeakMap<HTMLElement, LongestAnimation>();

// Tracks nodes that are animating away for the duration of the animation. This is
// used to prevent duplicate nodes from showing up when nodes have been toggled quickly
// from an `@if` or `@for`.
const leavingNodes = new WeakMap<TNode, HTMLElement[]>();

function clearLeavingNodes(tNode: TNode, el: HTMLElement): void {
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
function cancelLeavingNodes(tNode: TNode, lView: LView): void {
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

function trackLeavingNodes(tNode: TNode, el: HTMLElement): void {
  // We need to track this tNode's element just to be sure we don't add
  // a new RNode for this TNode while this one is still animating away.
  // once the animation is complete, we remove this reference.
  if (leavingNodes.has(tNode)) {
    leavingNodes.get(tNode)?.push(el);
  } else {
    leavingNodes.set(tNode, [el]);
  }
}

function getLViewEnterAnimations(lView: LView): Function[] {
  const animationData = (lView[ANIMATIONS] ??= {});
  return (animationData.enter ??= []);
}

function getLViewLeaveAnimations(lView: LView): Function[] {
  const animationData = (lView[ANIMATIONS] ??= {});
  return (animationData.leave ??= []);
}

function getClassListFromValue(value: string | Function | string[]): string[] | null {
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
 * Instruction to handle the `animate.enter` behavior for class bindings.
 *
 * @param value The value bound to `animate.enter`, which is a string or a function.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵanimateEnter(value: string | Function): typeof ɵɵanimateEnter {
  performanceMarkFeature('NgAnimateEnter');

  if ((typeof ngServerMode !== 'undefined' && ngServerMode) || !areAnimationSupported) {
    return ɵɵanimateEnter;
  }
  ngDevMode && assertAnimationTypes(value, 'animate.enter');

  const lView = getLView();
  if (areAnimationsDisabled(lView)) {
    return ɵɵanimateEnter;
  }

  const tNode = getCurrentTNode()!;

  cancelLeavingNodes(tNode, lView);

  getLViewEnterAnimations(lView).push(() => runEnterAnimation(lView, tNode, value));

  return ɵɵanimateEnter; // For chaining
}

export function runEnterAnimation(lView: LView, tNode: TNode, value: string | Function): void {
  const nativeElement = getNativeByTNode(tNode, lView) as HTMLElement;

  ngDevMode && assertElementNodes(nativeElement, 'animate.enter');

  const renderer = lView[RENDERER];
  const ngZone = lView[INJECTOR]!.get(NgZone);

  // Retrieve the actual class list from the value. This will resolve any resolver functions from
  // bindings.
  const activeClasses = getClassListFromValue(value);
  const cleanupFns: Function[] = [];

  // In the case where multiple animations are happening on the element, we need
  // to get the longest animation to ensure we don't complete animations early.
  // This also allows us to setup cancellation of animations in progress if the
  // gets removed early.
  const handleAnimationStart = (event: AnimationEvent | TransitionEvent) => {
    const eventName = event instanceof AnimationEvent ? 'animationend' : 'transitionend';
    ngZone.runOutsideAngular(() => {
      cleanupFns.push(renderer.listen(nativeElement, eventName, handleInAnimationEnd));
    });
  };

  // When the longest animation ends, we can remove all the classes
  const handleInAnimationEnd = (event: AnimationEvent | TransitionEvent) => {
    animationEnd(event, nativeElement, renderer);
  };

  // We only need to add these event listeners if there are actual classes to apply
  if (activeClasses && activeClasses.length > 0) {
    ngZone.runOutsideAngular(() => {
      cleanupFns.push(renderer.listen(nativeElement, 'animationstart', handleAnimationStart));
      cleanupFns.push(renderer.listen(nativeElement, 'transitionstart', handleAnimationStart));
    });

    trackEnterClasses(nativeElement, activeClasses, cleanupFns);

    for (const klass of activeClasses) {
      renderer.addClass(nativeElement, klass);
    }
    // In the case that the classes added have no animations, we need to remove
    // the classes right away. This could happen because someone is intentionally
    // preventing an animation via selector specificity.
    ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        determineLongestAnimation(nativeElement, longestAnimations, areAnimationSupported);
        if (!longestAnimations.has(nativeElement)) {
          for (const klass of activeClasses) {
            renderer.removeClass(nativeElement, klass);
          }
          cleanupEnterClassData(nativeElement);
        }
      });
    });
  }
}

/**
 * trackEnterClasses is necessary in the case of composition where animate.enter
 * is used on the same element in multiple places, like on the element and in a
 * host binding. When removing classes, we need the entire list of animation classes
 * added to properly remove them when the longest animation fires.
 */
function trackEnterClasses(el: HTMLElement, classList: string[], cleanupFns: Function[]) {
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
 * Instruction to handle the `(animate.enter)` behavior for event bindings, aka when
 * a user wants to use a custom animation function rather than a class.
 *
 * @param value The value bound to `(animate.enter)`, an AnimationFunction.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵanimateEnterListener(value: AnimationFunction): typeof ɵɵanimateEnterListener {
  performanceMarkFeature('NgAnimateEnter');

  if ((typeof ngServerMode !== 'undefined' && ngServerMode) || !areAnimationSupported) {
    return ɵɵanimateEnterListener;
  }

  ngDevMode && assertAnimationTypes(value, 'animate.enter');

  const lView = getLView();
  if (areAnimationsDisabled(lView)) {
    return ɵɵanimateEnterListener;
  }
  const tNode = getCurrentTNode()!;

  cancelLeavingNodes(tNode, lView);

  getLViewEnterAnimations(lView).push(() => runEnterAnimationFunction(lView, tNode, value));

  return ɵɵanimateEnterListener;
}

/**
 * runs enter animations when a custom function is provided
 */
function runEnterAnimationFunction(lView: LView, tNode: TNode, value: AnimationFunction) {
  const nativeElement = getNativeByTNode(tNode, lView) as HTMLElement;
  ngDevMode && assertElementNodes(nativeElement, 'animate.enter');

  value.call(lView[CONTEXT], {target: nativeElement, animationComplete: noOpAnimationComplete});
}

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
export function ɵɵanimateLeave(value: string | Function): typeof ɵɵanimateLeave {
  performanceMarkFeature('NgAnimateLeave');

  if ((typeof ngServerMode !== 'undefined' && ngServerMode) || !areAnimationSupported) {
    return ɵɵanimateLeave;
  }

  ngDevMode && assertAnimationTypes(value, 'animate.leave');

  const lView = getLView();
  const animationsDisabled = areAnimationsDisabled(lView);
  if (animationsDisabled) {
    return ɵɵanimateLeave;
  }

  const tNode = getCurrentTNode()!;

  getLViewLeaveAnimations(lView).push(() =>
    runLeaveAnimations(lView, tNode, value, animationsDisabled),
  );

  return ɵɵanimateLeave; // For chaining
}

function runLeaveAnimations(
  lView: LView,
  tNode: TNode,
  value: string | Function,
  animationsDisabled: boolean,
): Promise<void> {
  const {promise, resolve} = (Promise as unknown as PromiseConstructor).withResolvers<void>();
  const nativeElement = getNativeByTNode(tNode, lView) as Element;

  ngDevMode && assertElementNodes(nativeElement, 'animate.leave');

  const renderer = lView[RENDERER];
  const ngZone = lView[INJECTOR].get(NgZone);
  allLeavingAnimations.add(lView);

  const activeClasses = getClassListFromValue(value);
  if (activeClasses && activeClasses.length > 0) {
    animateLeaveClassRunner(
      nativeElement as HTMLElement,
      tNode,
      activeClasses,
      renderer,
      animationsDisabled,
      ngZone,
      resolve,
    );
  } else {
    resolve();
  }

  return promise;
}

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
export function ɵɵanimateLeaveListener(value: AnimationFunction): typeof ɵɵanimateLeaveListener {
  performanceMarkFeature('NgAnimateLeave');

  if ((typeof ngServerMode !== 'undefined' && ngServerMode) || !areAnimationSupported) {
    return ɵɵanimateLeaveListener;
  }

  ngDevMode && assertAnimationTypes(value, 'animate.leave');

  // Even when animations are disabled, we still need to register the element for removal
  // to ensure proper cleanup and allow developers to handle element removal in tests
  // So we don't have an early return here.

  const lView = getLView();
  const tNode = getCurrentTNode()!;
  allLeavingAnimations.add(lView);

  getLViewLeaveAnimations(lView).push(() => runLeaveAnimationFunction(lView, tNode, value));

  return ɵɵanimateLeaveListener; // For chaining
}

/**
 * runs leave animations when a custom function is provided
 */
function runLeaveAnimationFunction(
  lView: LView,
  tNode: TNode,
  value: AnimationFunction,
): Promise<void> {
  const {promise, resolve} = (Promise as unknown as PromiseConstructor).withResolvers<void>();
  const nativeElement = getNativeByTNode(tNode, lView) as Element;

  ngDevMode && assertElementNodes(nativeElement, 'animate.leave');

  const renderer = lView[RENDERER];
  const animationsDisabled = areAnimationsDisabled(lView);
  const ngZone = lView[INJECTOR]!.get(NgZone);
  const maxAnimationTimeout = lView[INJECTOR]!.get(MAX_ANIMATION_TIMEOUT);

  if (animationsDisabled) {
    resolve();
  } else {
    const timeoutId = setTimeout(() => {
      clearLeavingNodes(tNode, nativeElement as HTMLElement);
      resolve();
    }, maxAnimationTimeout);

    const event: AnimationCallbackEvent = {
      target: nativeElement,
      animationComplete: () => {
        clearLeavingNodes(tNode, nativeElement as HTMLElement);
        clearTimeout(timeoutId);
        resolve();
      },
    };
    trackLeavingNodes(tNode, nativeElement as HTMLElement);

    ngZone.runOutsideAngular(() => {
      renderer.listen(
        nativeElement,
        'animationend',
        () => {
          resolve();
        },
        {once: true},
      );
    });
    value.call(lView[CONTEXT], event);
  }

  // Ensure cleanup if the LView is destroyed before the animation runs.
  return promise;
}

function cancelAnimationsIfRunning(element: HTMLElement, renderer: Renderer): void {
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

function elementHasClassList(element: HTMLElement, classList: string[]): boolean {
  for (const className of classList) {
    if (element.classList.contains(className)) return true;
  }
  return false;
}

function isLongestAnimation(
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

function animationEnd(
  event: AnimationEvent | TransitionEvent,
  nativeElement: HTMLElement,
  renderer: Renderer,
) {
  const elementData = enterClassMap.get(nativeElement);
  if (!elementData) return;
  if (isLongestAnimation(event, nativeElement)) {
    // Now that we've found the longest animation, there's no need
    // to keep bubbling up this event as it's not going to apply to
    // other elements further up. We don't want it to inadvertently
    // affect any other animations on the page.
    event.stopImmediatePropagation();
    for (const klass of elementData.classList) {
      renderer.removeClass(nativeElement, klass);
    }
    cleanupEnterClassData(nativeElement);
  }
}

function assertAnimationTypes(value: string | Function, instruction: string) {
  if (value == null || (typeof value !== 'string' && typeof value !== 'function')) {
    throw new RuntimeError(
      RuntimeErrorCode.ANIMATE_INVALID_VALUE,
      `'${instruction}' value must be a string of CSS classes or an animation function, got ${stringify(value)}`,
    );
  }
}

function assertElementNodes(nativeElement: Element, instruction: string) {
  if ((nativeElement as Node).nodeType !== Node.ELEMENT_NODE) {
    throw new RuntimeError(
      RuntimeErrorCode.ANIMATE_INVALID_VALUE,
      `'${instruction}' can only be used on an element node, got ${stringify((nativeElement as Node).nodeType)}`,
    );
  }
}

/**
 * This function actually adds the classes that animate element that's leaving the DOM.
 * Once it finishes, it calls the remove function that was provided by the DOM renderer.
 */
function animateLeaveClassRunner(
  el: HTMLElement,
  tNode: TNode,
  classList: string[],
  renderer: Renderer,
  animationsDisabled: boolean,
  ngZone: NgZone,
  resolver: VoidFunction,
) {
  if (animationsDisabled) {
    longestAnimations.delete(el);
    resolver();
    return;
  }

  cancelAnimationsIfRunning(el, renderer);

  const handleOutAnimationEnd = (event: AnimationEvent | TransitionEvent | CustomEvent) => {
    if (event instanceof CustomEvent || isLongestAnimation(event, el)) {
      // Now that we've found the longest animation, there's no need
      // to keep bubbling up this event as it's not going to apply to
      // other elements further up. We don't want it to inadvertently
      // affect any other animations on the page.
      event.stopImmediatePropagation();
      longestAnimations.delete(el);
      clearLeavingNodes(tNode, el);

      if (Array.isArray(tNode.projection)) {
        // in the content projection case, the element is not destroyed.
        // So we need to remove the class at the end so that it isn't left
        // behind for whenever the item shows up again.
        for (const item of classList) {
          renderer.removeClass(el, item);
        }
      }
    }
    resolver();
  };

  ngZone.runOutsideAngular(() => {
    renderer.listen(el, 'animationend', handleOutAnimationEnd);
    renderer.listen(el, 'transitionend', handleOutAnimationEnd);
  });
  trackLeavingNodes(tNode, el);
  for (const item of classList) {
    renderer.addClass(el, item);
  }
  // In the case that the classes added have no animations, we need to remove
  // the element right away. This could happen because someone is intentionally
  // preventing an animation via selector specificity.
  ngZone.runOutsideAngular(() => {
    requestAnimationFrame(() => {
      determineLongestAnimation(el, longestAnimations, areAnimationSupported);
      if (!longestAnimations.has(el)) {
        clearLeavingNodes(tNode, el);
        resolver();
      }
    });
  });
}
