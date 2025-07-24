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
  AnimationClassFunction,
  AnimationEventFunction,
  AnimationFunction,
  AnimationRemoveFunction,
  ANIMATIONS_DISABLED,
  LongestAnimation,
} from '../../animation';
import {getLView, getCurrentTNode, getTView, getAnimationElementRemovalRegistry} from '../state';
import {RENDERER, INJECTOR, CONTEXT, FLAGS, LViewFlags} from '../interfaces/view';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {getNativeByTNode, storeCleanupWithContext} from '../util/view_utils';
import {performanceMarkFeature} from '../../util/performance';
import {Renderer} from '../interfaces/renderer';
import {RElement} from '../interfaces/renderer_dom';
import {NgZone} from '../../zone';
import {assertDefined} from '../../util/assert';

const DEFAULT_ANIMATIONS_DISABLED = false;
const WS_REGEXP = /\s+/;
const areAnimationSupported =
  (typeof ngServerMode === 'undefined' || !ngServerMode) &&
  typeof document !== 'undefined' &&
  // tslint:disable-next-line:no-toplevel-property-access
  typeof document?.documentElement?.getAnimations === 'function';

const noOpAnimationComplete = () => {};

/**
 * Instruction to handle the `animate.enter` behavior for class bindings.
 *
 * @param value The value bound to `animate.enter`, which is a string or a string array.
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
  const tNode = getCurrentTNode()!;
  const nativeElement = getNativeByTNode(tNode, lView) as HTMLElement;

  const renderer = lView[RENDERER];
  const injector = lView[INJECTOR]!;
  const ngZone = injector.get(NgZone);
  const animationsDisabled = injector.get(ANIMATIONS_DISABLED, DEFAULT_ANIMATIONS_DISABLED);

  // Retrieve the actual class list from the value. This will resolve any resolver functions from
  // bindings.
  const activeClasses = getClassListFromValue(value);

  let longestAnimation: LongestAnimation | undefined;
  const cleanupFns: Function[] = [];

  // In the case where multiple animations are happening on the element, we need
  // to get the longest animation to ensure we don't complete animations early.
  // This also allows us to setup cancellation of animations in progress if the
  // gets removed early.
  const handleAnimationStart = (event: AnimationEvent | TransitionEvent) => {
    setupAnimationCancel(event, activeClasses, renderer);
    longestAnimation = getLongestAnimation(event);

    const eventName = event instanceof AnimationEvent ? 'animationend' : 'transitionend';
    ngZone.runOutsideAngular(() => {
      cleanupFns.push(renderer.listen(nativeElement, eventName, handleInAnimationEnd));
    });
  };

  // When the longest animation ends, we can remove all the classes
  const handleInAnimationEnd = (event: AnimationEvent | TransitionEvent) => {
    animationEnd(event, nativeElement, longestAnimation, activeClasses, renderer, cleanupFns);
  };

  // We only need to add these event listeners if there are actual classes to apply
  if (activeClasses && activeClasses.length > 0) {
    if (!animationsDisabled) {
      ngZone.runOutsideAngular(() => {
        cleanupFns.push(renderer.listen(nativeElement, 'animationstart', handleAnimationStart));
        cleanupFns.push(renderer.listen(nativeElement, 'transitionstart', handleAnimationStart));
      });
    }

    for (const klass of activeClasses) {
      renderer.addClass(nativeElement as HTMLElement, klass);
    }
  }

  if (animationsDisabled) {
    // The animations will only be disabled in a test environment, and adding a microtask here
    // will allow the tests to be able to tick forward to resolve the next phase of animation
    // in their tests.
    Promise.resolve().then(() => {
      if (activeClasses !== null) {
        for (const klass of activeClasses) {
          renderer.removeClass(nativeElement, klass);
        }
      }
      for (const fn of cleanupFns) {
        fn();
      }
      // Classes remain, no animation, no automatic cleanup of these classes by this instruction.
    });
  }

  return ɵɵanimateEnter; // For chaining
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
  const tNode = getCurrentTNode()!;
  const nativeElement = getNativeByTNode(tNode, lView) as HTMLElement;

  value.call(lView[CONTEXT], {target: nativeElement, animationComplete: noOpAnimationComplete});

  return ɵɵanimateEnterListener;
}

/**
 * Instruction to handle the `animate.leave` behavior for class animations.
 * It registers an animation with the ElementRegistry to be run when the element
 * is scheduled for removal from the DOM.
 *
 * @param value The value bound to `animate.leave`, which can be a string or string array.
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
  const tView = getTView();
  const tNode = getCurrentTNode()!;
  const nativeElement = getNativeByTNode(tNode, lView) as Element;

  // This instruction is called in the update pass.
  const renderer = lView[RENDERER];
  const injector = lView[INJECTOR]!;

  // Assume ElementRegistry and ANIMATIONS_DISABLED are injectable services.
  const elementRegistry = getAnimationElementRemovalRegistry();
  ngDevMode &&
    assertDefined(
      elementRegistry.elements,
      'Expected `ElementRegistry` to be present in animations subsystem',
    );

  const animationsDisabled = injector.get(ANIMATIONS_DISABLED, DEFAULT_ANIMATIONS_DISABLED);
  const ngZone = injector.get(NgZone);

  // This function gets stashed in the registry to be used once the element removal process
  // begins. We pass in the values and resolvers so as to evaluate the resolved classes
  // at the latest possible time, meaning we evaluate them right before the animation
  // begins.
  const animate: AnimationClassFunction = (
    el: Element,
    value: Set<string> | null,
    resolvers: Function[] | undefined,
  ): AnimationRemoveFunction => {
    return (removalFn: VoidFunction) => {
      animateLeaveClassRunner(
        el as HTMLElement,
        getClassList(value, resolvers),
        removalFn,
        renderer,
        animationsDisabled,
        ngZone,
      );
    };
  };

  // Ensure cleanup if the LView is destroyed before the animation runs.
  if (lView[FLAGS] & LViewFlags.FirstLViewPass) {
    storeCleanupWithContext(tView, lView, nativeElement, (elToClean: Element) => {
      elementRegistry.elements!.remove(elToClean);
    });
  }

  elementRegistry.elements!.add(nativeElement, value, animate);

  return ɵɵanimateLeave; // For chaining
}

/**
 * Instruction to handle the `(animate.leave)` behavior for event bindings, aka when
 * a user wants to use a custom animation function rather than a class. It registers
 * an animation with the ElementRegistry to be run when the element is scheduled for
 * removal from the DOM.
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

  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = getTView();
  const nativeElement = getNativeByTNode(tNode, lView) as Element;

  if ((nativeElement as Node).nodeType !== Node.ELEMENT_NODE) {
    return ɵɵanimateLeaveListener;
  }

  // Assume ElementRegistry and ANIMATIONS_DISABLED are injectable services.
  const injector = lView[INJECTOR]!;
  const elementRegistry = getAnimationElementRemovalRegistry();
  ngDevMode &&
    assertDefined(
      elementRegistry.elements,
      'Expected `ElementRegistry` to be present in animations subsystem',
    );

  const animationsDisabled = injector.get(ANIMATIONS_DISABLED, DEFAULT_ANIMATIONS_DISABLED);

  const animate: AnimationEventFunction = (
    el: Element,
    value: AnimationFunction,
  ): AnimationRemoveFunction => {
    return (removeFn: VoidFunction): void => {
      const event: AnimationCallbackEvent = {
        target: nativeElement,
        animationComplete: () => {
          removeFn();
        },
      };
      if (animationsDisabled) {
        // add a microtask for test environments to be able to see classes
        // were added, then removed.
        Promise.resolve().then(() => {
          removeFn();
        });
      } else {
        value.call(lView[CONTEXT], event);
      }
    };
  };

  // Ensure cleanup if the LView is destroyed before the animation runs.
  if (lView[FLAGS] & LViewFlags.FirstLViewPass) {
    storeCleanupWithContext(tView, lView, nativeElement, (elToClean: Element) => {
      elementRegistry.elements!.remove(elToClean);
    });
  }
  elementRegistry.elements!.addCallback(nativeElement, value, animate);

  return ɵɵanimateLeaveListener; // For chaining
}

/**
 * Builds the list of classes to apply to an element based on either the passed in list of strings
 * or the set of resolver functions that are coming from bindings. Those resolver functions should
 * resolve into either a string or a string array. There may be multiple to support composition.
 */
function getClassList(value: Set<string> | null, resolvers: Function[] | undefined): Set<string> {
  const classList = new Set<string>(value);
  if (resolvers && resolvers.length) {
    for (const resolverFn of resolvers) {
      const resolvedValue = resolverFn();
      if (resolvedValue instanceof Array) {
        for (const rv of resolvedValue) {
          classList.add(rv);
        }
      } else {
        classList.add(resolvedValue);
      }
    }
  }
  return classList;
}

function cancelAnimationsIfRunning(element: HTMLElement): void {
  if (areAnimationSupported) {
    for (const animation of element.getAnimations()) {
      if (animation.playState === 'running') {
        animation.cancel();
      }
    }
  }
}

/**
 * Multiple animations can be set on an element. This grabs an element and
 * determines which of those will be the longest duration. If we didn't do
 * this, elements would be removed whenever the first animation completes.
 * This ensures we get the longest running animation and only remove when
 * that animation completes.
 */
function getLongestAnimation(
  event: AnimationEvent | TransitionEvent,
): LongestAnimation | undefined {
  if (!areAnimationSupported || !(event.target instanceof Element)) return;
  const nativeElement = event.target;
  const animations = nativeElement.getAnimations();
  if (animations.length === 0) return;

  let currentLongest: LongestAnimation = {
    animationName: undefined,
    propertyName: undefined,
    duration: 0,
  };
  for (const animation of animations) {
    const timing = animation.effect?.getTiming();
    // duration can be a string 'auto' or a number.
    const animDuration = typeof timing?.duration === 'number' ? timing.duration : 0;
    let duration = (timing?.delay ?? 0) + animDuration;

    let propertyName: string | undefined;
    let animationName: string | undefined;

    if ((animation as CSSAnimation).animationName) {
      animationName = (animation as CSSAnimation).animationName;
    } else {
      // Check for CSSTransition specific property
      propertyName = (animation as CSSTransition).transitionProperty;
    }

    if (duration >= currentLongest.duration) {
      currentLongest = {animationName, propertyName, duration};
    }
  }
  return currentLongest;
}

function getClassListFromValue(value: string | Function): string[] | null {
  const classes = typeof value === 'function' ? value() : value;
  let classList: string[] | null = classes instanceof Array ? classes : null;
  if (typeof classes === 'string') {
    classList = classes
      .trim()
      .split(WS_REGEXP)
      .filter((k) => k);
  }
  return classList;
}

function setupAnimationCancel(event: Event, classList: string[] | null, renderer: Renderer) {
  if (!(event.target instanceof Element)) return;
  const nativeElement = event.target;
  if (areAnimationSupported) {
    const animations = nativeElement.getAnimations();
    if (animations.length === 0) return;
    for (let animation of animations) {
      animation.addEventListener('cancel', (event: Event) => {
        if (nativeElement === event.target) {
          if (classList !== null) {
            for (const klass of classList) {
              renderer.removeClass(nativeElement as unknown as RElement, klass);
            }
          }
        }
      });
    }
  }
}

function isLongestAnimation(
  event: AnimationEvent | TransitionEvent,
  nativeElement: Element,
  longestAnimation: LongestAnimation | undefined,
): boolean {
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
  longestAnimation: LongestAnimation | undefined,
  classList: string[] | null,
  renderer: Renderer,
  cleanupFns: Function[],
) {
  if (isLongestAnimation(event, nativeElement, longestAnimation)) {
    // Now that we've found the longest animation, there's no need
    // to keep bubbling up this event as it's not going to apply to
    // other elements further up. We don't want it to inadvertently
    // affect any other animations on the page.
    event.stopImmediatePropagation();
    if (classList !== null) {
      for (const klass of classList) {
        renderer.removeClass(nativeElement, klass);
      }
    }
    for (const fn of cleanupFns) {
      fn();
    }
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

/**
 * This function actually adds the classes that animate element that's leaving the DOM.
 * Once it finishes, it calls the remove function that was provided by the DOM renderer.
 */
function animateLeaveClassRunner(
  el: HTMLElement,
  classList: Set<string>,
  finalRemoveFn: VoidFunction,
  renderer: Renderer,
  animationsDisabled: boolean,
  ngZone: NgZone,
) {
  cancelAnimationsIfRunning(el);

  let longestAnimation: LongestAnimation | undefined;
  const handleAnimationStart = (event: AnimationEvent | TransitionEvent) => {
    longestAnimation = getLongestAnimation(event);
  };

  const handleOutAnimationEnd = (event: AnimationEvent | TransitionEvent) => {
    if (isLongestAnimation(event, el, longestAnimation)) {
      // Now that we've found the longest animation, there's no need
      // to keep bubbling up this event as it's not going to apply to
      // other elements further up. We don't want it to inadvertently
      // affect any other animations on the page.
      event.stopImmediatePropagation();
      finalRemoveFn();
    }
  };

  if (!animationsDisabled) {
    ngZone.runOutsideAngular(() => {
      renderer.listen(el, 'animationstart', handleAnimationStart, {once: true});
      renderer.listen(el, 'transitionstart', handleAnimationStart, {once: true});
      renderer.listen(el, 'animationend', handleOutAnimationEnd);
      renderer.listen(el, 'transitionend', handleOutAnimationEnd);
    });
  }

  for (const item of classList) {
    renderer.addClass(el, item);
  }

  if (animationsDisabled) {
    // add a microtask for test environments to be able to see classes
    // were added, then removed.
    Promise.resolve().then(() => {
      finalRemoveFn();
    });
  }
}
