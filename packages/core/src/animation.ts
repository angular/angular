/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from './di/injection_token';

/**
 * A [DI token](api/core/InjectionToken) that enables or disables all enter and leave animations.
 */
export const ANIMATIONS_DISABLED = new InjectionToken<boolean>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'AnimationsDisabled' : '',
  {
    providedIn: 'root',
    factory: () => false,
  },
);

/**
 * The event type for when `animate.enter` and `animate.leave` are used with function
 * callbacks.
 *
 * @publicApi 20.2
 */
export type AnimationCallbackEvent = {target: Element; animationComplete: Function};

/**
 * A [DI token](api/core/InjectionToken) that configures the maximum animation timeout
 * before element removal. The default value mirrors from Chrome's cross document
 * navigation view transition timeout. It's intended to prevent people from accidentally
 * forgetting to call the removal function in their callback. Also serves as a delay
 * for when stylesheets are pruned.
 *
 * @publicApi 20.2
 */
export const MAX_ANIMATION_TIMEOUT = new InjectionToken<number>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'MaxAnimationTimeout' : '',
  {
    providedIn: 'root',
    factory: () => MAX_ANIMATION_TIMEOUT_DEFAULT,
  },
);
const MAX_ANIMATION_TIMEOUT_DEFAULT = 4000;

/**
 * The function type for `animate.enter` and `animate.leave` when they are used with
 * function callbacks.
 *
 * @publicApi 20.2
 */
export type AnimationFunction = (event: AnimationCallbackEvent) => void;

export type AnimationEventFunction = (
  el: Element,
  value: AnimationFunction,
) => AnimationRemoveFunction;
export type AnimationClassFunction = (
  el: Element,
  value: Set<string> | null,
  resolvers: Function[] | undefined,
) => AnimationRemoveFunction;
export type AnimationRemoveFunction = (removeFn: VoidFunction) => void;

export interface LongestAnimation {
  animationName: string | undefined;
  propertyName: string | undefined;
  duration: number;
}

export interface AnimationDetails {
  classes: Set<string> | null;
  classFns?: Function[];
  animateFn: AnimationRemoveFunction;
}

export interface AnimationRemovalRegistry {
  elements: ElementRegistry | undefined;
}

/**
 * Registers elements for delayed removal action for animation in the case
 * that `animate.leave` is used. This stores the target element and any
 * classes, class resolvers, and callback functions that may be needed
 * to apply the removal animation, and then stashes the actual element
 * removal function from the dom renderer to be called after the
 * animation is finished.
 */
export class ElementRegistry {
  private outElements = new WeakMap<Element, AnimationDetails>();

  remove(el: Element): void {
    this.outElements.delete(el);
  }

  /** Used when animate.leave is only applying classes */
  trackClasses(details: AnimationDetails, classes: string | string[]): void {
    const classList = typeof classes === 'string' ? [classes] : classes;
    for (let klass of classList) {
      details.classes?.add(klass);
    }
  }

  /** Used when animate.leave is applying classes via a bound attribute
   *  which requires resolving the binding function at the right time
   *  to get the proper class list. There may be multiple resolvers due
   *  to composition via host bindings.
   */
  trackResolver(details: AnimationDetails, resolver: Function): void {
    if (!details.classFns) {
      details.classFns = [resolver];
    } else {
      details.classFns.push(resolver);
    }
  }

  /** Used when `animate.leave` is using the function signature and will have a
   *  callback function, rather than a list of classes.
   */
  addCallback(
    el: Element,
    value: AnimationFunction,
    animateWrapperFn: AnimationEventFunction,
  ): void {
    const details = this.outElements.get(el) ?? {
      classes: null,
      animateFn: () => {},
    };
    details.animateFn = animateWrapperFn(el, value);
    this.outElements.set(el, details);
  }

  /** Used when `animate.leave` is using classes. */
  add(el: Element, value: string | string[] | Function, animateWrapperFn: AnimationClassFunction) {
    const details = this.outElements.get(el) ?? {
      classes: new Set<string>(),
      animateFn: (): void => {},
    };
    if (typeof value === 'function') {
      this.trackResolver(details, value);
    } else {
      this.trackClasses(details, value);
    }
    details.animateFn = animateWrapperFn(el, details.classes, details.classFns);
    this.outElements.set(el, details);
  }

  has(el: Element): boolean {
    return this.outElements.has(el);
  }

  /** This is called by the dom renderer to actually initiate the animation
   *  using the animateFn stored in the registry. The DOM renderer passes in
   *  the removal function to be fired off when the animation finishes.
   */
  animate(el: Element, removeFn: Function, maxAnimationTimeout: number): void {
    if (!this.outElements.has(el)) return removeFn();
    const details = this.outElements.get(el)!;
    let timeoutId: ReturnType<typeof setTimeout>;
    let called = false;
    const remove = () => {
      // This called check is to prevent a rare race condition where the timing of removal
      // might result in the removal function being called twice.
      if (called) return;
      called = true;
      clearTimeout(timeoutId);
      this.remove(el);
      removeFn();
    };
    // this timeout is used to ensure elements actually get removed in the case
    // that the user forgot to call the remove callback. The timeout is cleared
    // in the DOM renderer during the remove child process.
    timeoutId = setTimeout(remove, maxAnimationTimeout);
    details.animateFn(remove);
  }
}
