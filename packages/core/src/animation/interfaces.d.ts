/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '../di/injection_token';
/**
 * A [DI token](api/core/InjectionToken) that enables or disables all enter and leave animations.
 */
export declare const ANIMATIONS_DISABLED: InjectionToken<boolean>;
/**
 * The event type for when `animate.enter` and `animate.leave` are used with function
 * callbacks.
 *
 * @publicApi 20.2
 */
export type AnimationCallbackEvent = {
    target: Element;
    animationComplete: Function;
};
/**
 * A [DI token](api/core/InjectionToken) that configures the maximum animation timeout
 * before element removal. The default value mirrors from Chrome's cross document
 * navigation view transition timeout. It's intended to prevent people from accidentally
 * forgetting to call the removal function in their callback. Also serves as a delay
 * for when stylesheets are pruned.
 *
 * @publicApi 20.2
 */
export declare const MAX_ANIMATION_TIMEOUT: InjectionToken<number>;
/**
 * The function type for `animate.enter` and `animate.leave` when they are used with
 * function callbacks.
 *
 * @publicApi 20.2
 */
export type AnimationFunction = (event: AnimationCallbackEvent) => void;
export type AnimationEventFunction = (el: Element, value: AnimationFunction) => AnimationRemoveFunction;
export type AnimationClassFunction = (el: Element, value: Set<string> | null, resolvers: Function[] | undefined) => AnimationRemoveFunction;
export type AnimationRemoveFunction = (removeFn: VoidFunction) => void;
export interface AnimationDetails {
    classes: Set<string> | null;
    classFns?: Function[];
    animateFn: AnimationRemoveFunction;
    isEventBinding: boolean;
}
export interface LongestAnimation {
    animationName: string | undefined;
    propertyName: string | undefined;
    duration: number;
}
export interface AnimationLViewData {
    enter?: Function[];
    leave?: (() => Promise<void>)[];
    running?: Promise<unknown>;
    skipLeaveAnimations?: boolean;
}
