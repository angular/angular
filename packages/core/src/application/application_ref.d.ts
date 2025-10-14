/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../util/ng_hmr_mode';
import '../util/ng_jit_mode';
import '../util/ng_server_mode';
import { type Observable, Subject } from 'rxjs';
import { InjectionToken } from '../di/injection_token';
import { EnvironmentInjector } from '../di/r3_injector';
import { Type } from '../interface/type';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { ViewRef } from '../linker/view_ref';
import { ViewRef as InternalViewRef } from '../render3/view_ref';
import { NgZone } from '../zone/ng_zone';
import { TracingSnapshot } from './tracing';
/**
 * A DI token that provides a set of callbacks to
 * be called for every component that is bootstrapped.
 *
 * Each callback must take a `ComponentRef` instance and return nothing.
 *
 * `(componentRef: ComponentRef) => void`
 *
 * @publicApi
 */
export declare const APP_BOOTSTRAP_LISTENER: InjectionToken<readonly ((compRef: ComponentRef<any>) => void)[]>;
export declare function publishDefaultGlobalUtils(): void;
/**
 * Sets the error for an invalid write to a signal to be an Angular `RuntimeError`.
 */
export declare function publishSignalConfiguration(): void;
export declare function isBoundToModule<C>(cf: ComponentFactory<C>): boolean;
/**
 * Provides additional options to the bootstrapping process.
 *
 * @publicApi
 * @deprecated 20.2 Configure `NgZone` in the `providers` array of the application module instead.
 */
export interface BootstrapOptions {
    /**
     * Optionally specify which `NgZone` should be used when not configured in the providers.
     *
     * - Provide your own `NgZone` instance.
     * - `zone.js` - Use default `NgZone` which requires `Zone.js`.
     * - `noop` - Use `NoopNgZone` which does nothing.
     *
     * @deprecated BootstrapOptions is deprecated. Provide `NgZone` in the `providers` array of the module instead.
     */
    ngZone?: NgZone | 'zone.js' | 'noop';
    /**
     * Optionally specify coalescing event change detections or not.
     * Consider the following case.
     *
     * ```html
     * <div (click)="doSomething()">
     *   <button (click)="doSomethingElse()"></button>
     * </div>
     * ```
     *
     * When button is clicked, because of the event bubbling, both
     * event handlers will be called and 2 change detections will be
     * triggered. We can coalesce such kind of events to only trigger
     * change detection only once.
     *
     * By default, this option will be false. So the events will not be
     * coalesced and the change detection will be triggered multiple times.
     * And if this option be set to true, the change detection will be
     * triggered async by scheduling a animation frame. So in the case above,
     * the change detection will only be triggered once.
     *
     * @deprecated BootstrapOptions is deprecated. Use `provideZoneChangeDetection` instead to configure coalescing.
     */
    ngZoneEventCoalescing?: boolean;
    /**
     * Optionally specify if `NgZone#run()` method invocations should be coalesced
     * into a single change detection.
     *
     * Consider the following case.
     * ```ts
     * for (let i = 0; i < 10; i ++) {
     *   ngZone.run(() => {
     *     // do something
     *   });
     * }
     * ```
     *
     * This case triggers the change detection multiple times.
     * With ngZoneRunCoalescing options, all change detections in an event loop trigger only once.
     * In addition, the change detection executes in requestAnimation.
     *
     * @deprecated BootstrapOptions is deprecated. Use `provideZoneChangeDetection` instead to configure coalescing.
     */
    ngZoneRunCoalescing?: boolean;
}
export declare function optionsReducer<T extends Object>(dst: T, objs: T | T[]): T;
/**
 * A reference to an Angular application running on a page.
 *
 * @usageNotes
 * ### isStable examples and caveats
 *
 * Note two important points about `isStable`, demonstrated in the examples below:
 * - the application will never be stable if you start any kind
 * of recurrent asynchronous task when the application starts
 * (for example for a polling process, started with a `setInterval`, a `setTimeout`
 * or using RxJS operators like `interval`);
 * - the `isStable` Observable runs outside of the Angular zone.
 *
 * Let's imagine that you start a recurrent task
 * (here incrementing a counter, using RxJS `interval`),
 * and at the same time subscribe to `isStable`.
 *
 * ```ts
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *      filter(stable => stable)
 *   ).subscribe(() => console.log('App is stable now');
 *   interval(1000).subscribe(counter => console.log(counter));
 * }
 * ```
 * In this example, `isStable` will never emit `true`,
 * and the trace "App is stable now" will never get logged.
 *
 * If you want to execute something when the app is stable,
 * you have to wait for the application to be stable
 * before starting your polling process.
 *
 * ```ts
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     tap(stable => console.log('App is stable now')),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => console.log(counter));
 * }
 * ```
 * In this example, the trace "App is stable now" will be logged
 * and then the counter starts incrementing every second.
 *
 * Note also that this Observable runs outside of the Angular zone,
 * which means that the code in the subscription
 * to this Observable will not trigger the change detection.
 *
 * Let's imagine that instead of logging the counter value,
 * you update a field of your component
 * and display it in its template.
 *
 * ```ts
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => this.value = counter);
 * }
 * ```
 * As the `isStable` Observable runs outside the zone,
 * the `value` field will be updated properly,
 * but the template will not be refreshed!
 *
 * You'll have to manually trigger the change detection to update the template.
 *
 * ```ts
 * constructor(appRef: ApplicationRef, cd: ChangeDetectorRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => {
 *     this.value = counter;
 *     cd.detectChanges();
 *   });
 * }
 * ```
 *
 * Or make the subscription callback run inside the zone.
 *
 * ```ts
 * constructor(appRef: ApplicationRef, zone: NgZone) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => zone.run(() => this.value = counter));
 * }
 * ```
 *
 * @publicApi
 */
export declare class ApplicationRef {
    /** @internal */
    _runningTick: boolean;
    private _destroyed;
    private _destroyListeners;
    /** @internal */
    _views: InternalViewRef<unknown>[];
    private readonly internalErrorHandler;
    private readonly afterRenderManager;
    private readonly zonelessEnabled;
    private readonly rootEffectScheduler;
    /**
     * Current dirty state of the application across a number of dimensions (views, afterRender hooks,
     * etc).
     *
     * A flag set here means that `tick()` will attempt to resolve the dirtiness when executed.
     *
     * @internal
     */
    dirtyFlags: ApplicationRefDirtyFlags;
    /**
     * Most recent snapshot from the `TracingService`, if any.
     *
     * This snapshot attempts to capture the context when `tick()` was first
     * scheduled. It then runs wrapped in this context.
     *
     * @internal
     */
    tracingSnapshot: TracingSnapshot | null;
    private allTestViews;
    private autoDetectTestViews;
    private includeAllTestViews;
    /** @internal */
    afterTick: Subject<void>;
    /** @internal */
    get allViews(): Array<InternalViewRef<unknown>>;
    /**
     * Indicates whether this instance was destroyed.
     */
    get destroyed(): boolean;
    /**
     * Get a list of component types registered to this application.
     * This list is populated even before the component is created.
     */
    readonly componentTypes: Type<any>[];
    /**
     * Get a list of components registered to this application.
     */
    readonly components: ComponentRef<any>[];
    private internalPendingTask;
    /**
     * Returns an Observable that indicates when the application is stable or unstable.
     */
    get isStable(): Observable<boolean>;
    constructor();
    /**
     * @returns A promise that resolves when the application becomes stable
     */
    whenStable(): Promise<void>;
    private readonly _injector;
    private _rendererFactory;
    /**
     * The `EnvironmentInjector` used to create this application.
     */
    get injector(): EnvironmentInjector;
    /**
     * Bootstrap a component onto the element identified by its selector or, optionally, to a
     * specified element.
     *
     * @usageNotes
     * ### Bootstrap process
     *
     * When bootstrapping a component, Angular mounts it onto a target DOM element
     * and kicks off automatic change detection. The target DOM element can be
     * provided using the `rootSelectorOrNode` argument.
     *
     * If the target DOM element is not provided, Angular tries to find one on a page
     * using the `selector` of the component that is being bootstrapped
     * (first matched element is used).
     *
     * ### Example
     *
     * Generally, we define the component to bootstrap in the `bootstrap` array of `NgModule`,
     * but it requires us to know the component while writing the application code.
     *
     * Imagine a situation where we have to wait for an API call to decide about the component to
     * bootstrap. We can use the `ngDoBootstrap` hook of the `NgModule` and call this method to
     * dynamically bootstrap a component.
     *
     * {@example core/ts/platform/platform.ts region='componentSelector'}
     *
     * Optionally, a component can be mounted onto a DOM element that does not match the
     * selector of the bootstrapped component.
     *
     * In the following example, we are providing a CSS selector to match the target element.
     *
     * {@example core/ts/platform/platform.ts region='cssSelector'}
     *
     * While in this example, we are providing reference to a DOM node.
     *
     * {@example core/ts/platform/platform.ts region='domNode'}
     */
    bootstrap<C>(component: Type<C>, rootSelectorOrNode?: string | any): ComponentRef<C>;
    /**
     * Bootstrap a component onto the element identified by its selector or, optionally, to a
     * specified element.
     *
     * @usageNotes
     * ### Bootstrap process
     *
     * When bootstrapping a component, Angular mounts it onto a target DOM element
     * and kicks off automatic change detection. The target DOM element can be
     * provided using the `rootSelectorOrNode` argument.
     *
     * If the target DOM element is not provided, Angular tries to find one on a page
     * using the `selector` of the component that is being bootstrapped
     * (first matched element is used).
     *
     * ### Example
     *
     * Generally, we define the component to bootstrap in the `bootstrap` array of `NgModule`,
     * but it requires us to know the component while writing the application code.
     *
     * Imagine a situation where we have to wait for an API call to decide about the component to
     * bootstrap. We can use the `ngDoBootstrap` hook of the `NgModule` and call this method to
     * dynamically bootstrap a component.
     *
     * {@example core/ts/platform/platform.ts region='componentSelector'}
     *
     * Optionally, a component can be mounted onto a DOM element that does not match the
     * selector of the bootstrapped component.
     *
     * In the following example, we are providing a CSS selector to match the target element.
     *
     * {@example core/ts/platform/platform.ts region='cssSelector'}
     *
     * While in this example, we are providing reference to a DOM node.
     *
     * {@example core/ts/platform/platform.ts region='domNode'}
     *
     * @deprecated Passing Component factories as the `Application.bootstrap` function argument is
     *     deprecated. Pass Component Types instead.
     */
    bootstrap<C>(componentFactory: ComponentFactory<C>, rootSelectorOrNode?: string | any): ComponentRef<C>;
    private bootstrapImpl;
    /**
     * Invoke this method to explicitly process change detection and its side-effects.
     *
     * In development mode, `tick()` also performs a second change detection cycle to ensure that no
     * further changes are detected. If additional changes are picked up during this second cycle,
     * bindings in the app have side-effects that cannot be resolved in a single change detection
     * pass.
     * In this case, Angular throws an error, since an Angular application can only have one change
     * detection pass during which all change detection must complete.
     */
    tick(): void;
    /** @internal */
    _tick(): void;
    private tickImpl;
    /**
     * Performs the core work of synchronizing the application state with the UI, resolving any
     * pending dirtiness (potentially in a loop).
     */
    private synchronize;
    /**
     * Perform a single synchronization pass.
     */
    private synchronizeOnce;
    /**
     * Checks `allViews` for views which require refresh/traversal, and updates `dirtyFlags`
     * accordingly, with two potential behaviors:
     *
     * 1. If any of our views require updating, then this adds the `ViewTreeTraversal` dirty flag.
     *    This _should_ be a no-op, since the scheduler should've added the flag at the same time the
     *    view was marked as needing updating.
     *
     *    TODO(alxhub): figure out if this behavior is still needed for edge cases.
     *
     * 2. If none of our views require updating, then clear the view-related `dirtyFlag`s. This
     *    happens when the scheduler is notified of a view becoming dirty, but the view itself isn't
     *    reachable through traversal from our roots (e.g. it's detached from the CD tree).
     */
    private syncDirtyFlagsWithViews;
    /**
     * Attaches a view so that it will be dirty checked.
     * The view will be automatically detached when it is destroyed.
     * This will throw if the view is already attached to a ViewContainer.
     */
    attachView(viewRef: ViewRef): void;
    /**
     * Detaches a view from dirty checking again.
     */
    detachView(viewRef: ViewRef): void;
    private _loadComponent;
    /** @internal */
    ngOnDestroy(): void;
    /**
     * Registers a listener to be called when an instance is destroyed.
     *
     * @param callback A callback function to add as a listener.
     * @returns A function which unregisters a listener.
     */
    onDestroy(callback: () => void): VoidFunction;
    /**
     * Destroys an Angular application represented by this `ApplicationRef`. Calling this function
     * will destroy the associated environment injectors as well as all the bootstrapped components
     * with their views.
     */
    destroy(): void;
    /**
     * Returns the number of attached views.
     */
    get viewCount(): number;
}
export declare function remove<T>(list: T[], el: T): void;
export declare const enum ApplicationRefDirtyFlags {
    None = 0,
    /**
     * A global change detection round has been requested.
     */
    ViewTreeGlobal = 1,
    /**
     * Part of the view tree is marked for traversal.
     */
    ViewTreeTraversal = 2,
    /**
     * Part of the view tree is marked to be checked (dirty).
     */
    ViewTreeCheck = 4,
    /**
     * Helper for any view tree bit being set.
     */
    ViewTreeAny = 7,
    /**
     * After render hooks need to run.
     */
    AfterRender = 8,
    /**
     * Effects at the `ApplicationRef` level.
     */
    RootEffects = 16
}
