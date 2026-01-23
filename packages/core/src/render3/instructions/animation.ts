/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AnimationClassBindingFn,
  AnimationCallbackEvent,
  AnimationFunction,
  MAX_ANIMATION_TIMEOUT,
} from '../../animation/interfaces';
import {getLView, getCurrentTNode} from '../state';
import {RENDERER, INJECTOR, CONTEXT, LView, ID} from '../interfaces/view';
import {getNativeByTNode} from '../util/view_utils';
import {performanceMarkFeature} from '../../util/performance';
import {Renderer} from '../interfaces/renderer';
import {NgZone} from '../../zone';
import {determineLongestAnimation, allLeavingAnimations} from '../../animation/longest_animation';
import {TNode} from '../interfaces/node';
import {promiseWithResolvers} from '../../util/promise_with_resolvers';

import {
  addAnimationToLView,
  areAnimationsDisabled,
  areAnimationSupported,
  assertAnimationTypes,
  assertElementNodes,
  cancelAnimationsIfRunning,
  cancelLeavingNodes,
  cleanupAfterLeaveAnimations,
  cleanupEnterClassData,
  clearLeavingNodes,
  clearLViewNodeAnimationResolvers,
  enterClassMap,
  getClassListFromValue,
  getLViewEnterAnimations,
  getLViewLeaveAnimations,
  isLongestAnimation,
  leaveAnimationFunctionCleanup,
  longestAnimations,
  noOpAnimationComplete,
  trackEnterClasses,
  trackLeavingNodes,
} from '../../animation/utils';
import {initializeAnimationQueueScheduler, queueEnterAnimations} from '../../animation/queue';

/**
 * Instruction to handle the `animate.enter` behavior for class bindings.
 *
 * @param value The value bound to `animate.enter`, which is a string or a function.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵanimateEnter(value: string | AnimationClassBindingFn): typeof ɵɵanimateEnter {
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

  addAnimationToLView(getLViewEnterAnimations(lView), tNode, () =>
    runEnterAnimation(lView, tNode, value),
  );

  initializeAnimationQueueScheduler(lView[INJECTOR]);

  // We have to queue here due to the animation instruction being invoked after the element
  // instruction. The DOM node has to exist before we can queue an animation. Any node that
  // is not inside of control flow needs to get queued here. For nodes inside of control
  // flow, those are queued in node_manipulation.ts and are deduped by a Set in the animation
  // queue.
  queueEnterAnimations(lView[INJECTOR], getLViewEnterAnimations(lView));

  return ɵɵanimateEnter; // For chaining
}

export function runEnterAnimation(
  lView: LView,
  tNode: TNode,
  value: string | AnimationClassBindingFn,
): void {
  const nativeElement = getNativeByTNode(tNode, lView) as HTMLElement;

  ngDevMode && assertElementNodes(nativeElement, 'animate.enter');

  const renderer = lView[RENDERER];
  const ngZone = lView[INJECTOR]!.get(NgZone);

  // Retrieve the actual class list from the value. This will resolve any resolver functions from
  // bindings.
  const activeClasses = getClassListFromValue(value);
  const cleanupFns: VoidFunction[] = [];

  // In the case where multiple animations are happening on the element, we need
  // to get the longest animation to ensure we don't complete animations early.
  // This also allows us to setup cancellation of animations in progress if the
  // gets removed early.
  const handleEnterAnimationStart = (event: AnimationEvent | TransitionEvent) => {
    // this early exit case is to prevent issues with bubbling events that are from child element animations
    if (event.target !== nativeElement) return;

    const eventName = event instanceof AnimationEvent ? 'animationend' : 'transitionend';
    ngZone.runOutsideAngular(() => {
      renderer.listen(nativeElement, eventName, handleEnterAnimationEnd);
    });
  };

  // When the longest animation ends, we can remove all the classes
  const handleEnterAnimationEnd = (event: AnimationEvent | TransitionEvent) => {
    // this early exit case is to prevent issues with bubbling events that are from child element animations
    if (event.target !== nativeElement) return;

    enterAnimationEnd(event, nativeElement, renderer);
  };

  // We only need to add these event listeners if there are actual classes to apply
  if (activeClasses && activeClasses.length > 0) {
    ngZone.runOutsideAngular(() => {
      cleanupFns.push(renderer.listen(nativeElement, 'animationstart', handleEnterAnimationStart));
      cleanupFns.push(renderer.listen(nativeElement, 'transitionstart', handleEnterAnimationStart));
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

function enterAnimationEnd(
  event: AnimationEvent | TransitionEvent,
  nativeElement: HTMLElement,
  renderer: Renderer,
) {
  const elementData = enterClassMap.get(nativeElement);
  // this event.target check is to prevent issues with bubbling events that are from child element animations
  if (event.target !== nativeElement || !elementData) return;
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

  addAnimationToLView(getLViewEnterAnimations(lView), tNode, () =>
    runEnterAnimationFunction(lView, tNode, value),
  );

  initializeAnimationQueueScheduler(lView[INJECTOR]);

  // We have to queue here due to the animation instruction being invoked after the element
  // instruction. The DOM node has to exist before we can queue an animation. Any node that
  // is not inside of control flow needs to get queued here. For nodes inside of control
  // flow, those are queued in node_manipulation.ts and are deduped by a Set in the animation
  // queue.
  queueEnterAnimations(lView[INJECTOR], getLViewEnterAnimations(lView));

  return ɵɵanimateEnterListener;
}

/**
 * runs enter animations when a custom function is provided
 */
function runEnterAnimationFunction(lView: LView, tNode: TNode, value: AnimationFunction): void {
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
export function ɵɵanimateLeave(value: string | AnimationClassBindingFn): typeof ɵɵanimateLeave {
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
  cancelLeavingNodes(tNode, lView);

  addAnimationToLView(getLViewLeaveAnimations(lView), tNode, () =>
    runLeaveAnimations(lView, tNode, value),
  );

  initializeAnimationQueueScheduler(lView[INJECTOR]);

  return ɵɵanimateLeave; // For chaining
}

function runLeaveAnimations(
  lView: LView,
  tNode: TNode,
  value: string | AnimationClassBindingFn,
): {promise: Promise<void>; resolve: VoidFunction} {
  const {promise, resolve} = promiseWithResolvers<void>();
  const nativeElement = getNativeByTNode(tNode, lView) as Element;

  ngDevMode && assertElementNodes(nativeElement, 'animate.leave');

  const renderer = lView[RENDERER];
  const ngZone = lView[INJECTOR].get(NgZone);
  allLeavingAnimations.add(lView[ID]);
  (getLViewLeaveAnimations(lView).get(tNode.index)!.resolvers ??= []).push(resolve);

  const activeClasses = getClassListFromValue(value);
  if (activeClasses && activeClasses.length > 0) {
    animateLeaveClassRunner(
      nativeElement as HTMLElement,
      tNode,
      lView,
      activeClasses,
      renderer,
      ngZone,
    );
  } else {
    resolve();
  }

  return {promise, resolve};
}

/**
 * This function actually adds the classes that animate element that's leaving the DOM.
 * Once it finishes, it calls the remove function that was provided by the DOM renderer.
 */
function animateLeaveClassRunner(
  el: HTMLElement,
  tNode: TNode,
  lView: LView,
  classList: string[],
  renderer: Renderer,
  ngZone: NgZone,
) {
  cancelAnimationsIfRunning(el, renderer);
  const cleanupFns: VoidFunction[] = [];
  const resolvers = getLViewLeaveAnimations(lView).get(tNode.index)?.resolvers;

  const handleOutAnimationEnd = (event: AnimationEvent | TransitionEvent | CustomEvent) => {
    // this early exit case is to prevent issues with bubbling events that are from child element animations
    if (event.target !== el) return;
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
      cleanupAfterLeaveAnimations(resolvers, cleanupFns);
      clearLViewNodeAnimationResolvers(lView, tNode);
    }
  };

  ngZone.runOutsideAngular(() => {
    cleanupFns.push(renderer.listen(el, 'animationend', handleOutAnimationEnd));
    cleanupFns.push(renderer.listen(el, 'transitionend', handleOutAnimationEnd));
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
        cleanupAfterLeaveAnimations(resolvers, cleanupFns);
        clearLViewNodeAnimationResolvers(lView, tNode);
      }
    });
  });
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
  cancelLeavingNodes(tNode, lView);

  allLeavingAnimations.add(lView[ID]);

  addAnimationToLView(getLViewLeaveAnimations(lView), tNode, () =>
    runLeaveAnimationFunction(lView, tNode, value),
  );

  initializeAnimationQueueScheduler(lView[INJECTOR]);

  return ɵɵanimateLeaveListener; // For chaining
}

/**
 * runs leave animations when a custom function is provided
 */
function runLeaveAnimationFunction(
  lView: LView,
  tNode: TNode,
  value: AnimationFunction,
): {promise: Promise<void>; resolve: VoidFunction} {
  const {promise, resolve} = promiseWithResolvers<void>();
  const nativeElement = getNativeByTNode(tNode, lView) as Element;

  ngDevMode && assertElementNodes(nativeElement, 'animate.leave');

  const cleanupFns: VoidFunction[] = [];
  const renderer = lView[RENDERER];
  const animationsDisabled = areAnimationsDisabled(lView);
  const ngZone = lView[INJECTOR]!.get(NgZone);
  const maxAnimationTimeout = lView[INJECTOR]!.get(MAX_ANIMATION_TIMEOUT);

  (getLViewLeaveAnimations(lView).get(tNode.index)!.resolvers ??= []).push(resolve);
  const resolvers = getLViewLeaveAnimations(lView).get(tNode.index)?.resolvers;

  if (animationsDisabled) {
    leaveAnimationFunctionCleanup(
      lView,
      tNode,
      nativeElement as HTMLElement,
      resolvers,
      cleanupFns,
    );
  } else {
    const timeoutId = setTimeout(
      () =>
        leaveAnimationFunctionCleanup(
          lView,
          tNode,
          nativeElement as HTMLElement,
          resolvers,
          cleanupFns,
        ),
      maxAnimationTimeout,
    );

    const event: AnimationCallbackEvent = {
      target: nativeElement,
      animationComplete: () => {
        leaveAnimationFunctionCleanup(
          lView,
          tNode,
          nativeElement as HTMLElement,
          resolvers,
          cleanupFns,
        );
        clearTimeout(timeoutId);
      },
    };
    trackLeavingNodes(tNode, nativeElement as HTMLElement);

    ngZone.runOutsideAngular(() => {
      cleanupFns.push(
        renderer.listen(
          nativeElement,
          'animationend',
          () => {
            leaveAnimationFunctionCleanup(
              lView,
              tNode,
              nativeElement as HTMLElement,
              resolvers,
              cleanupFns,
            );
            clearTimeout(timeoutId);
          },
          {once: true},
        ),
      );
    });
    value.call(lView[CONTEXT], event);
  }

  // Ensure cleanup if the LView is destroyed before the animation runs.
  return {promise, resolve};
}
