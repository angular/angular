/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentRef, EnvironmentInjector, EventEmitter, InjectionToken, OnDestroy, OnInit, Signal, SimpleChanges } from '@angular/core';
import { Data } from '../models';
import { ActivatedRoute } from '../router_state';
/**
 * An `InjectionToken` provided by the `RouterOutlet` and can be set using the `routerOutletData`
 * input.
 *
 * When unset, this value is `null` by default.
 *
 * @usageNotes
 *
 * To set the data from the template of the component with `router-outlet`:
 * ```html
 * <router-outlet [routerOutletData]="{name: 'Angular'}" />
 * ```
 *
 * To read the data in the routed component:
 * ```ts
 * data = inject(ROUTER_OUTLET_DATA) as Signal<{name: string}>;
 * ```
 *
 * @publicApi
 */
export declare const ROUTER_OUTLET_DATA: InjectionToken<Signal<unknown>>;
/**
 * An interface that defines the contract for developing a component outlet for the `Router`.
 *
 * An outlet acts as a placeholder that Angular dynamically fills based on the current router state.
 *
 * A router outlet should register itself with the `Router` via
 * `ChildrenOutletContexts#onChildOutletCreated` and unregister with
 * `ChildrenOutletContexts#onChildOutletDestroyed`. When the `Router` identifies a matched `Route`,
 * it looks for a registered outlet in the `ChildrenOutletContexts` and activates it.
 *
 * @see {@link ChildrenOutletContexts}
 * @publicApi
 */
export interface RouterOutletContract {
    /**
     * Whether the given outlet is activated.
     *
     * An outlet is considered "activated" if it has an active component.
     */
    isActivated: boolean;
    /** The instance of the activated component or `null` if the outlet is not activated. */
    component: Object | null;
    /**
     * The `Data` of the `ActivatedRoute` snapshot.
     */
    activatedRouteData: Data;
    /**
     * The `ActivatedRoute` for the outlet or `null` if the outlet is not activated.
     */
    activatedRoute: ActivatedRoute | null;
    /**
     * Called by the `Router` when the outlet should activate (create a component).
     */
    activateWith(activatedRoute: ActivatedRoute, environmentInjector: EnvironmentInjector): void;
    /**
     * A request to destroy the currently activated component.
     *
     * When a `RouteReuseStrategy` indicates that an `ActivatedRoute` should be removed but stored for
     * later re-use rather than destroyed, the `Router` will call `detach` instead.
     */
    deactivate(): void;
    /**
     * Called when the `RouteReuseStrategy` instructs to detach the subtree.
     *
     * This is similar to `deactivate`, but the activated component should _not_ be destroyed.
     * Instead, it is returned so that it can be reattached later via the `attach` method.
     */
    detach(): ComponentRef<unknown>;
    /**
     * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree.
     */
    attach(ref: ComponentRef<unknown>, activatedRoute: ActivatedRoute): void;
    /**
     * Emits an activate event when a new component is instantiated
     **/
    activateEvents?: EventEmitter<unknown>;
    /**
     * Emits a deactivate event when a component is destroyed.
     */
    deactivateEvents?: EventEmitter<unknown>;
    /**
     * Emits an attached component instance when the `RouteReuseStrategy` instructs to re-attach a
     * previously detached subtree.
     **/
    attachEvents?: EventEmitter<unknown>;
    /**
     * Emits a detached component instance when the `RouteReuseStrategy` instructs to detach the
     * subtree.
     */
    detachEvents?: EventEmitter<unknown>;
    /**
     * Used to indicate that the outlet is able to bind data from the `Router` to the outlet
     * component's inputs.
     *
     * When this is `undefined` or `false` and the developer has opted in to the
     * feature using `withComponentInputBinding`, a warning will be logged in dev mode if this outlet
     * is used in the application.
     */
    readonly supportsBindingToComponentInputs?: true;
}
/**
 * @description
 *
 * Acts as a placeholder that Angular dynamically fills based on the current router state.
 *
 * Each outlet can have a unique name, determined by the optional `name` attribute.
 * The name cannot be set or changed dynamically. If not set, default value is "primary".
 *
 * ```html
 * <router-outlet></router-outlet>
 * <router-outlet name='left'></router-outlet>
 * <router-outlet name='right'></router-outlet>
 * ```
 *
 * Named outlets can be the targets of secondary routes.
 * The `Route` object for a secondary route has an `outlet` property to identify the target outlet:
 *
 * `{path: <base-path>, component: <component>, outlet: <target_outlet_name>}`
 *
 * Using named outlets and secondary routes, you can target multiple outlets in
 * the same `RouterLink` directive.
 *
 * The router keeps track of separate branches in a navigation tree for each named outlet and
 * generates a representation of that tree in the URL.
 * The URL for a secondary route uses the following syntax to specify both the primary and secondary
 * routes at the same time:
 *
 * `http://base-path/primary-route-path(outlet-name:route-path)`
 *
 * A router outlet emits an activate event when a new component is instantiated,
 * deactivate event when a component is destroyed.
 * An attached event emits when the `RouteReuseStrategy` instructs the outlet to reattach the
 * subtree, and the detached event emits when the `RouteReuseStrategy` instructs the outlet to
 * detach the subtree.
 *
 * ```html
 * <router-outlet
 *   (activate)='onActivate($event)'
 *   (deactivate)='onDeactivate($event)'
 *   (attach)='onAttach($event)'
 *   (detach)='onDetach($event)'></router-outlet>
 * ```
 *
 * @see {@link RouterLink}
 * @see {@link Route}
 * @ngModule RouterModule
 *
 * @publicApi
 */
export declare class RouterOutlet implements OnDestroy, OnInit, RouterOutletContract {
    private activated;
    /** @internal */
    get activatedComponentRef(): ComponentRef<any> | null;
    private _activatedRoute;
    /**
     * The name of the outlet
     *
     */
    name: string;
    activateEvents: EventEmitter<any>;
    deactivateEvents: EventEmitter<any>;
    /**
     * Emits an attached component instance when the `RouteReuseStrategy` instructs to re-attach a
     * previously detached subtree.
     **/
    attachEvents: EventEmitter<unknown>;
    /**
     * Emits a detached component instance when the `RouteReuseStrategy` instructs to detach the
     * subtree.
     */
    detachEvents: EventEmitter<unknown>;
    /**
     * Data that will be provided to the child injector through the `ROUTER_OUTLET_DATA` token.
     *
     * When unset, the value of the token is `undefined` by default.
     */
    readonly routerOutletData: import("@angular/core").InputSignal<unknown>;
    private parentContexts;
    private location;
    private changeDetector;
    private inputBinder;
    /** @docs-private */
    readonly supportsBindingToComponentInputs = true;
    /** @docs-private */
    ngOnChanges(changes: SimpleChanges): void;
    /** @docs-private */
    ngOnDestroy(): void;
    private isTrackedInParentContexts;
    /** @docs-private */
    ngOnInit(): void;
    private initializeOutletWithName;
    get isActivated(): boolean;
    /**
     * @returns The currently activated component instance.
     * @throws An error if the outlet is not activated.
     */
    get component(): Object;
    get activatedRoute(): ActivatedRoute;
    get activatedRouteData(): Data;
    /**
     * Called when the `RouteReuseStrategy` instructs to detach the subtree
     */
    detach(): ComponentRef<any>;
    /**
     * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
     */
    attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute): void;
    deactivate(): void;
    activateWith(activatedRoute: ActivatedRoute, environmentInjector: EnvironmentInjector): void;
}
export declare const INPUT_BINDER: InjectionToken<RoutedComponentInputBinder>;
/**
 * Injectable used as a tree-shakable provider for opting in to binding router data to component
 * inputs.
 *
 * The RouterOutlet registers itself with this service when an `ActivatedRoute` is attached or
 * activated. When this happens, the service subscribes to the `ActivatedRoute` observables (params,
 * queryParams, data) and sets the inputs of the component using `ComponentRef.setInput`.
 * Importantly, when an input does not have an item in the route data with a matching key, this
 * input is set to `undefined`. If it were not done this way, the previous information would be
 * retained if the data got removed from the route (i.e. if a query parameter is removed).
 *
 * The `RouterOutlet` should unregister itself when destroyed via `unsubscribeFromRouteData` so that
 * the subscriptions are cleaned up.
 */
export declare class RoutedComponentInputBinder {
    private outletDataSubscriptions;
    bindActivatedRouteToOutletComponent(outlet: RouterOutlet): void;
    unsubscribeFromRouteData(outlet: RouterOutlet): void;
    private subscribeToRouteData;
}
