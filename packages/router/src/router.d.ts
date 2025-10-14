/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Signal, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from './events';
import { NavigationBehaviorOptions, OnSameUrlNavigation, Routes } from './models';
import { Navigation, NavigationExtras, UrlCreationOptions } from './navigation_transition';
import { RouteReuseStrategy } from './route_reuse_strategy';
import { IsActiveMatchOptions, UrlTree } from './url_tree';
import { RouterState } from './router_state';
/**
 * The equivalent `IsActiveMatchOptions` options for `Router.isActive` is called with `true`
 * (exact = true).
 */
export declare const exactMatchOptions: IsActiveMatchOptions;
/**
 * The equivalent `IsActiveMatchOptions` options for `Router.isActive` is called with `false`
 * (exact = false).
 */
export declare const subsetMatchOptions: IsActiveMatchOptions;
/**
 * @description
 *
 * A service that facilitates navigation among views and URL manipulation capabilities.
 * This service is provided in the root scope and configured with [provideRouter](api/router/provideRouter).
 *
 * @see {@link Route}
 * @see {@link provideRouter}
 * @see [Routing and Navigation Guide](guide/routing/common-router-tasks).
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
export declare class Router {
    private get currentUrlTree();
    private get rawUrlTree();
    private disposed;
    private nonRouterCurrentEntryChangeSubscription?;
    private readonly console;
    private readonly stateManager;
    private readonly options;
    private readonly pendingTasks;
    private readonly urlUpdateStrategy;
    private readonly navigationTransitions;
    private readonly urlSerializer;
    private readonly location;
    private readonly urlHandlingStrategy;
    private readonly injector;
    /**
     * The private `Subject` type for the public events exposed in the getter. This is used internally
     * to push events to. The separate field allows us to expose separate types in the public API
     * (i.e., an Observable rather than the Subject).
     */
    private _events;
    /**
     * An event stream for routing events.
     */
    get events(): Observable<Event>;
    /**
     * The current state of routing in this NgModule.
     */
    get routerState(): RouterState;
    /**
     * True if at least one navigation event has occurred,
     * false otherwise.
     */
    navigated: boolean;
    /**
     * A strategy for re-using routes.
     *
     * @deprecated Configure using `providers` instead:
     *   `{provide: RouteReuseStrategy, useClass: MyStrategy}`.
     */
    routeReuseStrategy: RouteReuseStrategy;
    /**
     * How to handle a navigation request to the current URL.
     *
     *
     * @deprecated Configure this through `provideRouter` or `RouterModule.forRoot` instead.
     * @see {@link withRouterConfig}
     * @see {@link provideRouter}
     * @see {@link RouterModule}
     */
    onSameUrlNavigation: OnSameUrlNavigation;
    config: Routes;
    /**
     * Indicates whether the application has opted in to binding Router data to component inputs.
     *
     * This option is enabled by the `withComponentInputBinding` feature of `provideRouter` or
     * `bindToComponentInputs` in the `ExtraOptions` of `RouterModule.forRoot`.
     */
    readonly componentInputBindingEnabled: boolean;
    /**
     * Signal of the current `Navigation` object when the router is navigating, and `null` when idle.
     *
     * Note: The current navigation becomes to null after the NavigationEnd event is emitted.
     */
    readonly currentNavigation: Signal<Navigation | null>;
    constructor();
    private eventsSubscription;
    private subscribeToNavigationEvents;
    /** @internal */
    resetRootComponentType(rootComponentType: Type<any>): void;
    /**
     * Sets up the location change listener and performs the initial navigation.
     */
    initialNavigation(): void;
    /**
     * Sets up the location change listener. This listener detects navigations triggered from outside
     * the Router (the browser back/forward buttons, for example) and schedules a corresponding Router
     * navigation so that the correct events, guards, etc. are triggered.
     */
    setUpLocationChangeListener(): void;
    /**
     * Schedules a router navigation to synchronize Router state with the browser state.
     *
     * This is done as a response to a popstate event and the initial navigation. These
     * two scenarios represent times when the browser URL/state has been updated and
     * the Router needs to respond to ensure its internal state matches.
     */
    private navigateToSyncWithBrowser;
    /** The current URL. */
    get url(): string;
    /**
     * Returns the current `Navigation` object when the router is navigating,
     * and `null` when idle.
     *
     * @deprecated 20.2 Use the `currentNavigation` signal instead.
     */
    getCurrentNavigation(): Navigation | null;
    /**
     * The `Navigation` object of the most recent navigation to succeed and `null` if there
     *     has not been a successful navigation yet.
     */
    get lastSuccessfulNavigation(): Signal<Navigation | null>;
    /**
     * Resets the route configuration used for navigation and generating links.
     *
     * @param config The route array for the new configuration.
     *
     * @usageNotes
     *
     * ```ts
     * router.resetConfig([
     *  { path: 'team/:id', component: TeamCmp, children: [
     *    { path: 'simple', component: SimpleCmp },
     *    { path: 'user/:name', component: UserCmp }
     *  ]}
     * ]);
     * ```
     */
    resetConfig(config: Routes): void;
    /** @docs-private */
    ngOnDestroy(): void;
    /** Disposes of the router. */
    dispose(): void;
    /**
     * Appends URL segments to the current URL tree to create a new URL tree.
     *
     * @param commands An array of URL fragments with which to construct the new URL tree.
     * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path
     * segments, followed by the parameters for each segment.
     * The fragments are applied to the current URL tree or the one provided  in the `relativeTo`
     * property of the options object, if supplied.
     * @param navigationExtras Options that control the navigation strategy.
     * @returns The new URL tree.
     *
     * @usageNotes
     *
     * ```
     * // create /team/33/user/11
     * router.createUrlTree(['/team', 33, 'user', 11]);
     *
     * // create /team/33;expand=true/user/11
     * router.createUrlTree(['/team', 33, {expand: true}, 'user', 11]);
     *
     * // you can collapse static segments like this (this works only with the first passed-in value):
     * router.createUrlTree(['/team/33/user', userId]);
     *
     * // If the first segment can contain slashes, and you do not want the router to split it,
     * // you can do the following:
     * router.createUrlTree([{segmentPath: '/one/two'}]);
     *
     * // create /team/33/(user/11//right:chat)
     * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: 'chat'}}]);
     *
     * // remove the right secondary node
     * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
     *
     * // assuming the current url is `/team/33/user/11` and the route points to `user/11`
     *
     * // navigate to /team/33/user/11/details
     * router.createUrlTree(['details'], {relativeTo: route});
     *
     * // navigate to /team/33/user/22
     * router.createUrlTree(['../22'], {relativeTo: route});
     *
     * // navigate to /team/44/user/22
     * router.createUrlTree(['../../team/44/user/22'], {relativeTo: route});
     *
     * Note that a value of `null` or `undefined` for `relativeTo` indicates that the
     * tree should be created relative to the root.
     * ```
     */
    createUrlTree(commands: readonly any[], navigationExtras?: UrlCreationOptions): UrlTree;
    /**
     * Navigates to a view using an absolute route path.
     *
     * @param url An absolute path for a defined route. The function does not apply any delta to the
     *     current URL.
     * @param extras An object containing properties that modify the navigation strategy.
     *
     * @returns A Promise that resolves to 'true' when navigation succeeds,
     * to 'false' when navigation fails, or is rejected on error.
     *
     * @usageNotes
     *
     * The following calls request navigation to an absolute path.
     *
     * ```ts
     * router.navigateByUrl("/team/33/user/11");
     *
     * // Navigate without updating the URL
     * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
     * ```
     *
     * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
     *
     */
    navigateByUrl(url: string | UrlTree, extras?: NavigationBehaviorOptions): Promise<boolean>;
    /**
     * Navigate based on the provided array of commands and a starting point.
     * If no starting route is provided, the navigation is absolute.
     *
     * @param commands An array of URL fragments with which to construct the target URL.
     * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path
     * segments, followed by the parameters for each segment.
     * The fragments are applied to the current URL or the one provided  in the `relativeTo` property
     * of the options object, if supplied.
     * @param extras An options object that determines how the URL should be constructed or
     *     interpreted.
     *
     * @returns A Promise that resolves to `true` when navigation succeeds, or `false` when navigation
     *     fails. The Promise is rejected when an error occurs if `resolveNavigationPromiseOnError` is
     * not `true`.
     *
     * @usageNotes
     *
     * The following calls request navigation to a dynamic route path relative to the current URL.
     *
     * ```ts
     * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
     *
     * // Navigate without updating the URL, overriding the default behavior
     * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true});
     * ```
     *
     * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
     *
     */
    navigate(commands: readonly any[], extras?: NavigationExtras): Promise<boolean>;
    /** Serializes a `UrlTree` into a string */
    serializeUrl(url: UrlTree): string;
    /** Parses a string into a `UrlTree` */
    parseUrl(url: string): UrlTree;
    /**
     * Returns whether the url is activated.
     *
     * @deprecated
     * Use `IsActiveMatchOptions` instead.
     *
     * - The equivalent `IsActiveMatchOptions` for `true` is
     * `{paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored'}`.
     * - The equivalent for `false` is
     * `{paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored'}`.
     */
    isActive(url: string | UrlTree, exact: boolean): boolean;
    /**
     * Returns whether the url is activated.
     */
    isActive(url: string | UrlTree, matchOptions: IsActiveMatchOptions): boolean;
    /** @internal */
    isActive(url: string | UrlTree, matchOptions: boolean | IsActiveMatchOptions): boolean;
    private removeEmptyProps;
    private scheduleNavigation;
}
