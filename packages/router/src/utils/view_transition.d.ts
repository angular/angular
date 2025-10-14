/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken, Injector } from '@angular/core';
import { ActivatedRouteSnapshot } from '../router_state';
export declare const CREATE_VIEW_TRANSITION: InjectionToken<typeof createViewTransition>;
export declare const VIEW_TRANSITION_OPTIONS: InjectionToken<ViewTransitionsFeatureOptions & {
    skipNextTransition: boolean;
}>;
/**
 * Options to configure the View Transitions integration in the Router.
 *
 * @developerPreview 20.0
 * @see withViewTransitions
 */
export interface ViewTransitionsFeatureOptions {
    /**
     * Skips the very first call to `startViewTransition`. This can be useful for disabling the
     * animation during the application's initial loading phase.
     */
    skipInitialTransition?: boolean;
    /**
     * A function to run after the `ViewTransition` is created.
     *
     * This function is run in an injection context and can use `inject`.
     */
    onViewTransitionCreated?: (transitionInfo: ViewTransitionInfo) => void;
}
/**
 * The information passed to the `onViewTransitionCreated` function provided in the
 * `withViewTransitions` feature options.
 *
 * @developerPreview 20.0
 */
export interface ViewTransitionInfo {
    /**
     * The `ViewTransition` returned by the call to `startViewTransition`.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition
     */
    transition: ViewTransition;
    /**
     * The `ActivatedRouteSnapshot` that the navigation is transitioning from.
     */
    from: ActivatedRouteSnapshot;
    /**
     * The `ActivatedRouteSnapshot` that the navigation is transitioning to.
     */
    to: ActivatedRouteSnapshot;
}
/**
 * A helper function for using browser view transitions. This function skips the call to
 * `startViewTransition` if the browser does not support it.
 *
 * @returns A Promise that resolves when the view transition callback begins.
 */
export declare function createViewTransition(injector: Injector, from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot): Promise<void>;
