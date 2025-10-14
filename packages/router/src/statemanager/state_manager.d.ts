/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Location } from '@angular/common';
import { SubscriptionLike } from 'rxjs';
import { Event, NavigationTrigger, PrivateRouterEvents } from '../events';
import { Navigation, RestoredState } from '../navigation_transition';
import { RouterState } from '../router_state';
import { UrlHandlingStrategy } from '../url_handling_strategy';
import { UrlSerializer, UrlTree } from '../url_tree';
export declare abstract class StateManager {
    protected readonly urlSerializer: UrlSerializer;
    private readonly options;
    protected readonly canceledNavigationResolution: "replace" | "computed";
    protected location: Location;
    protected urlHandlingStrategy: UrlHandlingStrategy;
    protected urlUpdateStrategy: "eager" | "deferred";
    private currentUrlTree;
    /**
     * Returns the currently activated `UrlTree`.
     *
     * This `UrlTree` shows only URLs that the `Router` is configured to handle (through
     * `UrlHandlingStrategy`).
     *
     * The value is set after finding the route config tree to activate but before activating the
     * route.
     */
    getCurrentUrlTree(): UrlTree;
    private rawUrlTree;
    /**
     * Returns a `UrlTree` that is represents what the browser is actually showing.
     *
     * In the life of a navigation transition:
     * 1. When a navigation begins, the raw `UrlTree` is updated to the full URL that's being
     * navigated to.
     * 2. During a navigation, redirects are applied, which might only apply to _part_ of the URL (due
     * to `UrlHandlingStrategy`).
     * 3. Just before activation, the raw `UrlTree` is updated to include the redirects on top of the
     * original raw URL.
     *
     * Note that this is _only_ here to support `UrlHandlingStrategy.extract` and
     * `UrlHandlingStrategy.shouldProcessUrl`. Without those APIs, the current `UrlTree` would not
     * deviated from the raw `UrlTree`.
     *
     * For `extract`, a raw `UrlTree` is needed because `extract` may only return part
     * of the navigation URL. Thus, the current `UrlTree` may only represent _part_ of the browser
     * URL. When a navigation gets cancelled and the router needs to reset the URL or a new navigation
     * occurs, it needs to know the _whole_ browser URL, not just the part handled by
     * `UrlHandlingStrategy`.
     * For `shouldProcessUrl`, when the return is `false`, the router ignores the navigation but
     * still updates the raw `UrlTree` with the assumption that the navigation was caused by the
     * location change listener due to a URL update by the AngularJS router. In this case, the router
     * still need to know what the browser's URL is for future navigations.
     */
    getRawUrlTree(): UrlTree;
    protected createBrowserPath({ finalUrl, initialUrl, targetBrowserUrl }: Navigation): string;
    protected commitTransition({ targetRouterState, finalUrl, initialUrl }: Navigation): void;
    private routerState;
    /** Returns the current RouterState. */
    getRouterState(): RouterState;
    private stateMemento;
    protected updateStateMemento(): void;
    private createStateMemento;
    protected resetInternalState({ finalUrl }: Navigation): void;
    /** Returns the current state stored by the browser for the current history entry. */
    abstract restoredState(): RestoredState | null | undefined;
    /**
     * Registers a listener that is called whenever the current history entry changes by some API
     * outside the Router. This includes user-activated changes like back buttons and link clicks, but
     * also includes programmatic APIs called by non-Router JavaScript.
     */
    abstract registerNonRouterCurrentEntryChangeListener(listener: (url: string, state: RestoredState | null | undefined, trigger: NavigationTrigger) => void): SubscriptionLike;
    /**
     * Handles a navigation event sent from the Router. These are typically events that indicate a
     * navigation has started, progressed, been cancelled, or finished.
     */
    abstract handleRouterEvent(e: Event | PrivateRouterEvents, currentTransition: Navigation): void;
}
export declare class HistoryStateManager extends StateManager {
    /**
     * The id of the currently active page in the router.
     * Updated to the transition's target id on a successful navigation.
     *
     * This is used to track what page the router last activated. When an attempted navigation fails,
     * the router can then use this to compute how to restore the state back to the previously active
     * page.
     */
    private currentPageId;
    private lastSuccessfulId;
    restoredState(): RestoredState | null | undefined;
    /**
     * The ɵrouterPageId of whatever page is currently active in the browser history. This is
     * important for computing the target page id for new navigations because we need to ensure each
     * page id in the browser history is 1 more than the previous entry.
     */
    private get browserPageId();
    registerNonRouterCurrentEntryChangeListener(listener: (url: string, state: RestoredState | null | undefined, trigger: NavigationTrigger) => void): SubscriptionLike;
    handleRouterEvent(e: Event | PrivateRouterEvents, currentTransition: Navigation): void;
    private setBrowserUrl;
    /**
     * Performs the necessary rollback action to restore the browser URL to the
     * state before the transition.
     */
    private restoreHistory;
    private resetUrlToCurrentUrlTree;
    private generateNgRouterState;
}
