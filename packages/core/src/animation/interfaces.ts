/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '../di/injection_token';

/**
 * A [DI token](api/core/InjectionToken) that enables or disables all enter and leave animations.
 */
export const ANIMATIONS_DISABLED = new InjectionToken<boolean>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'AnimationsDisabled' : '',
  {
    factory: () => false,
  },
);

/**
 * The event type for when `animate.enter` and `animate.leave` are used with function
 * callbacks.
 *
 * @see [Animating your applications with animate.enter and animate.leave](guide/animations)
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
 * @see [Animating your applications with animate.enter and animate.leave](guide/animations)
 */
export const MAX_ANIMATION_TIMEOUT = new InjectionToken<number>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'MaxAnimationTimeout' : '',
  {
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

export type RunEnterAnimationFn = VoidFunction;
export type RunLeaveAnimationFn = () => {promise: Promise<void>; resolve: VoidFunction};

export interface LongestAnimation {
  animationName: string | undefined;
  propertyName: string | undefined;
  duration: number;
}

export interface EnterNodeAnimations {
  animateFns: RunEnterAnimationFn[];
  resolvers?: VoidFunction[];
}
export interface LeaveNodeAnimations {
  animateFns: RunLeaveAnimationFn[];
  resolvers?: VoidFunction[];
}

export interface AnimationLViewData {
  // Enter animations that apply to nodes in this view
  enter?: Map<number, EnterNodeAnimations>;

  // Leave animations that apply to nodes in this view
  leave?: Map<number, LeaveNodeAnimations>;

  // Leave animations that apply to nodes in this view
  // We chose to use unknown instead of PromiseSettledResult<void> to avoid requiring the type
  running?: Promise<unknown>;

  // Animation functions that have been queued for this view when the view is detached.
  // This is used to later remove them from the global animation queue if the view
  // is attached before the animation queue runs. This is used in cases where views are
  // moved or swapped during list reconciliation.
  detachedLeaveAnimationFns?: VoidFunction[];
}

/**
 * Function that returns the class or class list binded to the animate instruction
 */
export type AnimationClassBindingFn = () => string | string[];
