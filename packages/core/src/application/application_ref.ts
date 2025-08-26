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

import {
  setActiveConsumer,
  getActiveConsumer,
  setThrowInvalidWriteToSignalError,
} from '../../primitives/signals';
import {type Observable, Subject, type Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

import {ZONELESS_ENABLED} from '../change_detection/scheduling/zoneless_scheduling';
import {Console} from '../console';
import {inject} from '../di';
import {Injectable} from '../di/injectable';
import {InjectionToken} from '../di/injection_token';
import {Injector} from '../di/injector';
import {EnvironmentInjector, type R3Injector} from '../di/r3_injector';
import {formatRuntimeError, RuntimeError, RuntimeErrorCode} from '../errors';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from '../error_handler';
import {Type} from '../interface/type';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {NgModuleRef} from '../linker/ng_module_factory';
import {ViewRef} from '../linker/view_ref';
import {PendingTasksInternal} from '../pending_tasks_internal';
import {RendererFactory2} from '../render/api';
import {AfterRenderManager} from '../render3/after_render/manager';
import {ComponentFactory as R3ComponentFactory} from '../render3/component_ref';
import {isStandalone} from '../render3/def_getters';
import {ChangeDetectionMode, detectChangesInternal} from '../render3/instructions/change_detection';
import {LView} from '../render3/interfaces/view';
import {publishDefaultGlobalUtils as _publishDefaultGlobalUtils} from '../render3/util/global_utils';
import {requiresRefreshOrTraversal} from '../render3/util/view_utils';
import {ViewRef as InternalViewRef} from '../render3/view_ref';
import {TESTABILITY} from '../testability/testability';
import {NgZone} from '../zone/ng_zone';

import {profiler} from '../render3/profiler';
import {ProfilerEvent} from '../render3/profiler_types';
import {EffectScheduler} from '../render3/reactivity/root_effect_scheduler';
import {isReactiveLViewConsumer} from '../render3/reactive_lview_consumer';
import {ApplicationInitStatus} from './application_init';
import {TracingAction, TracingService, TracingSnapshot} from './tracing';

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
export const APP_BOOTSTRAP_LISTENER = new InjectionToken<
  ReadonlyArray<(compRef: ComponentRef<any>) => void>
>(ngDevMode ? 'appBootstrapListener' : '');

export function publishDefaultGlobalUtils() {
  ngDevMode && _publishDefaultGlobalUtils();
}

/**
 * Sets the error for an invalid write to a signal to be an Angular `RuntimeError`.
 */
export function publishSignalConfiguration(): void {
  setThrowInvalidWriteToSignalError(() => {
    let errorMessage = '';
    if (ngDevMode) {
      const activeConsumer = getActiveConsumer();
      errorMessage =
        activeConsumer && isReactiveLViewConsumer(activeConsumer)
          ? 'Writing to signals is not allowed while Angular renders the template (eg. interpolations)'
          : 'Writing to signals is not allowed in a `computed`';
    }
    throw new RuntimeError(RuntimeErrorCode.SIGNAL_WRITE_FROM_ILLEGAL_CONTEXT, errorMessage);
  });
}

export function isBoundToModule<C>(cf: ComponentFactory<C>): boolean {
  return (cf as R3ComponentFactory<C>).isBoundToModule;
}

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

  /**
   * When false, change detection is scheduled when Angular receives
   * a clear indication that templates need to be refreshed. This includes:
   *
   * - calling `ChangeDetectorRef.markForCheck`
   * - calling `ComponentRef.setInput`
   * - updating a signal that is read in a template
   * - attaching a view that is marked dirty
   * - removing a view
   * - registering a render hook (templates are only refreshed if render hooks do one of the above)
   *
   * @deprecated This option was introduced out of caution as a way for developers to opt out of the
   *    new behavior in v18 which schedule change detection for the above events when they occur
   *    outside the Zone. After monitoring the results post-release, we have determined that this
   *    feature is working as desired and do not believe it should ever be disabled by setting
   *    this option to `true`.
   */
  ignoreChangesOutsideZone?: boolean;
}

/** Maximum number of times ApplicationRef will refresh all attached views in a single tick. */
const MAXIMUM_REFRESH_RERUNS = 10;

export function optionsReducer<T extends Object>(dst: T, objs: T | T[]): T {
  if (Array.isArray(objs)) {
    return objs.reduce(optionsReducer, dst);
  }
  return {...dst, ...objs};
}

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
@Injectable({providedIn: 'root'})
export class ApplicationRef {
  /** @internal */
  _runningTick: boolean = false;
  private _destroyed = false;
  private _destroyListeners: Array<() => void> = [];
  /** @internal */
  _views: InternalViewRef<unknown>[] = [];
  private readonly internalErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
  private readonly afterRenderManager = inject(AfterRenderManager);
  private readonly zonelessEnabled = inject(ZONELESS_ENABLED);
  private readonly rootEffectScheduler = inject(EffectScheduler);

  /**
   * Current dirty state of the application across a number of dimensions (views, afterRender hooks,
   * etc).
   *
   * A flag set here means that `tick()` will attempt to resolve the dirtiness when executed.
   *
   * @internal
   */
  dirtyFlags = ApplicationRefDirtyFlags.None;

  /**
   * Most recent snapshot from the `TracingService`, if any.
   *
   * This snapshot attempts to capture the context when `tick()` was first
   * scheduled. It then runs wrapped in this context.
   *
   * @internal
   */
  tracingSnapshot: TracingSnapshot | null = null;

  // Needed for ComponentFixture temporarily during migration of autoDetect behavior
  // Eventually the hostView of the fixture should just attach to ApplicationRef.
  private allTestViews: Set<InternalViewRef<unknown>> = new Set();
  private autoDetectTestViews: Set<InternalViewRef<unknown>> = new Set();
  private includeAllTestViews = false;
  /** @internal */
  afterTick = new Subject<void>();
  /** @internal */
  get allViews(): Array<InternalViewRef<unknown>> {
    return [
      ...(this.includeAllTestViews ? this.allTestViews : this.autoDetectTestViews).keys(),
      ...this._views,
    ];
  }

  /**
   * Indicates whether this instance was destroyed.
   */
  get destroyed() {
    return this._destroyed;
  }

  /**
   * Get a list of component types registered to this application.
   * This list is populated even before the component is created.
   */
  public readonly componentTypes: Type<any>[] = [];

  /**
   * Get a list of components registered to this application.
   */
  public readonly components: ComponentRef<any>[] = [];

  private internalPendingTask = inject(PendingTasksInternal);

  /**
   * Returns an Observable that indicates when the application is stable or unstable.
   */
  public get isStable(): Observable<boolean> {
    // This is a getter because it might be invoked after the application has been destroyed.
    return this.internalPendingTask.hasPendingTasksObservable.pipe(map((pending) => !pending));
  }

  constructor() {
    // Inject the tracing service to initialize it.
    inject(TracingService, {optional: true});
  }

  /**
   * @returns A promise that resolves when the application becomes stable
   */
  whenStable(): Promise<void> {
    let subscription: Subscription;
    return new Promise<void>((resolve) => {
      subscription = this.isStable.subscribe({
        next: (stable) => {
          if (stable) {
            resolve();
          }
        },
      });
    }).finally(() => {
      subscription.unsubscribe();
    });
  }

  private readonly _injector = inject(EnvironmentInjector);
  private _rendererFactory: RendererFactory2 | null = null;

  /**
   * The `EnvironmentInjector` used to create this application.
   */
  get injector(): EnvironmentInjector {
    return this._injector;
  }

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
  bootstrap<C>(
    componentFactory: ComponentFactory<C>,
    rootSelectorOrNode?: string | any,
  ): ComponentRef<C>;

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
  bootstrap<C>(
    componentOrFactory: ComponentFactory<C> | Type<C>,
    rootSelectorOrNode?: string | any,
  ): ComponentRef<C> {
    return this.bootstrapImpl(componentOrFactory, rootSelectorOrNode);
  }

  private bootstrapImpl<C>(
    componentOrFactory: ComponentFactory<C> | Type<C>,
    rootSelectorOrNode?: string | any,
    injector: Injector = Injector.NULL,
  ): ComponentRef<C> {
    const ngZone = this._injector.get(NgZone);
    return ngZone.run(() => {
      profiler(ProfilerEvent.BootstrapComponentStart);

      (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
      const isComponentFactory = componentOrFactory instanceof ComponentFactory;
      const initStatus = this._injector.get(ApplicationInitStatus);

      if (!initStatus.done) {
        let errorMessage = '';
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          const standalone = !isComponentFactory && isStandalone(componentOrFactory);
          errorMessage =
            'Cannot bootstrap as there are still asynchronous initializers running.' +
            (standalone
              ? ''
              : ' Bootstrap components in the `ngDoBootstrap` method of the root module.');
        }
        throw new RuntimeError(RuntimeErrorCode.ASYNC_INITIALIZERS_STILL_RUNNING, errorMessage);
      }

      let componentFactory: ComponentFactory<C>;
      if (isComponentFactory) {
        componentFactory = componentOrFactory;
      } else {
        const resolver = this._injector.get(ComponentFactoryResolver);
        componentFactory = resolver.resolveComponentFactory(componentOrFactory)!;
      }
      this.componentTypes.push(componentFactory.componentType);

      // Create a factory associated with the current module if it's not bound to some other
      const ngModule = isBoundToModule(componentFactory)
        ? undefined
        : this._injector.get(NgModuleRef);
      const selectorOrNode = rootSelectorOrNode || componentFactory.selector;
      const compRef = componentFactory.create(injector, [], selectorOrNode, ngModule);
      const nativeElement = compRef.location.nativeElement;
      const testability = compRef.injector.get(TESTABILITY, null);
      testability?.registerApplication(nativeElement);

      compRef.onDestroy(() => {
        this.detachView(compRef.hostView);
        remove(this.components, compRef);
        testability?.unregisterApplication(nativeElement);
      });

      this._loadComponent(compRef);
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const _console = this._injector.get(Console);
        _console.log(`Angular is running in development mode.`);
      }

      profiler(ProfilerEvent.BootstrapComponentEnd, compRef);

      return compRef;
    });
  }

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
  tick(): void {
    if (!this.zonelessEnabled) {
      this.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeGlobal;
    }
    this._tick();
  }

  /** @internal */
  _tick(): void {
    profiler(ProfilerEvent.ChangeDetectionStart);

    if (this.tracingSnapshot !== null) {
      // Ensure we always run `tickImpl()` in the context of the most recent snapshot,
      // if one exists. Snapshots may be reference counted by the implementation so
      // we want to ensure that if we request a snapshot that we use it.
      this.tracingSnapshot.run(TracingAction.CHANGE_DETECTION, this.tickImpl);
    } else {
      this.tickImpl();
    }
  }

  private tickImpl = (): void => {
    (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
    if (this._runningTick) {
      throw new RuntimeError(
        RuntimeErrorCode.RECURSIVE_APPLICATION_REF_TICK,
        ngDevMode && 'ApplicationRef.tick is called recursively',
      );
    }

    const prevConsumer = setActiveConsumer(null);
    try {
      this._runningTick = true;
      this.synchronize();
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        for (let view of this.allViews) {
          view.checkNoChanges();
        }
      }
    } finally {
      this._runningTick = false;
      this.tracingSnapshot?.dispose();
      this.tracingSnapshot = null;
      setActiveConsumer(prevConsumer);
      this.afterTick.next();

      profiler(ProfilerEvent.ChangeDetectionEnd);
    }
  };

  /**
   * Performs the core work of synchronizing the application state with the UI, resolving any
   * pending dirtiness (potentially in a loop).
   */
  private synchronize(): void {
    if (this._rendererFactory === null && !(this._injector as R3Injector).destroyed) {
      this._rendererFactory = this._injector.get(RendererFactory2, null, {optional: true});
    }

    let runs = 0;
    while (this.dirtyFlags !== ApplicationRefDirtyFlags.None && runs++ < MAXIMUM_REFRESH_RERUNS) {
      profiler(ProfilerEvent.ChangeDetectionSyncStart);
      this.synchronizeOnce();
      profiler(ProfilerEvent.ChangeDetectionSyncEnd);
    }

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && runs >= MAXIMUM_REFRESH_RERUNS) {
      throw new RuntimeError(
        RuntimeErrorCode.INFINITE_CHANGE_DETECTION,
        ngDevMode &&
          'Infinite change detection while refreshing application views. ' +
            'Ensure views are not calling `markForCheck` on every template execution or ' +
            'that afterRender hooks always mark views for check.',
      );
    }
  }

  /**
   * Perform a single synchronization pass.
   */
  private synchronizeOnce(): void {
    // First, process any dirty root effects.
    if (this.dirtyFlags & ApplicationRefDirtyFlags.RootEffects) {
      this.dirtyFlags &= ~ApplicationRefDirtyFlags.RootEffects;
      this.rootEffectScheduler.flush();
    }

    // First check dirty views, if there are any.
    let ranDetectChanges = false;
    if (this.dirtyFlags & ApplicationRefDirtyFlags.ViewTreeAny) {
      // Change detection on views starts in targeted mode (only check components if they're
      // marked as dirty) unless global checking is specifically requested via APIs like
      // `ApplicationRef.tick()` and the `NgZone` integration.
      const useGlobalCheck = Boolean(this.dirtyFlags & ApplicationRefDirtyFlags.ViewTreeGlobal);

      // Clear the view-related dirty flags.
      this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewTreeAny;

      // Set the AfterRender bit, as we're checking views and will need to run afterRender hooks.
      this.dirtyFlags |= ApplicationRefDirtyFlags.AfterRender;

      // Check all potentially dirty views.
      for (let {_lView} of this.allViews) {
        // When re-checking, only check views which actually need it.
        if (!useGlobalCheck && !requiresRefreshOrTraversal(_lView)) {
          continue;
        }

        const mode =
          useGlobalCheck && !this.zonelessEnabled
            ? // Global mode includes `CheckAlways` views.
              // When using zoneless, all root views must be explicitly marked for refresh, even if they are
              // `CheckAlways`.
              ChangeDetectionMode.Global
            : // Only refresh views with the `RefreshView` flag or views is a changed signal
              ChangeDetectionMode.Targeted;
        detectChangesInternal(_lView, mode);
        ranDetectChanges = true;
      }

      // If `markForCheck()` was called during view checking, it will have set the `ViewTreeCheck`
      // flag. We clear the flag here because, for backwards compatibility, `markForCheck()`
      // during view checking doesn't cause the view to be re-checked.
      this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewTreeCheck;

      // Check if any views are still dirty after checking and we need to loop back.
      this.syncDirtyFlagsWithViews();
      if (
        this.dirtyFlags &
        (ApplicationRefDirtyFlags.ViewTreeAny | ApplicationRefDirtyFlags.RootEffects)
      ) {
        // If any views or effects are still dirty after checking, loop back before running render
        // hooks.
        return;
      }
    }
    if (!ranDetectChanges) {
      // If we skipped refreshing views above, there might still be unflushed animations
      // because we never called `detectChangesInternal` on the views.
      this._rendererFactory?.begin?.();
      this._rendererFactory?.end?.();
    }

    // Even if there were no dirty views, afterRender hooks might still be dirty.
    if (this.dirtyFlags & ApplicationRefDirtyFlags.AfterRender) {
      this.dirtyFlags &= ~ApplicationRefDirtyFlags.AfterRender;
      this.afterRenderManager.execute();

      // afterRender hooks might influence dirty flags.
    }
    this.syncDirtyFlagsWithViews();
  }

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
  private syncDirtyFlagsWithViews(): void {
    if (this.allViews.some(({_lView}) => requiresRefreshOrTraversal(_lView))) {
      // If after running all afterRender callbacks new views are dirty, ensure we loop back.
      this.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeTraversal;
      return;
    } else {
      // Even though this flag may be set, none of _our_ views require traversal, and so the
      // `ApplicationRef` doesn't require any repeated checking.
      this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewTreeAny;
    }
  }

  /**
   * Attaches a view so that it will be dirty checked.
   * The view will be automatically detached when it is destroyed.
   * This will throw if the view is already attached to a ViewContainer.
   */
  attachView(viewRef: ViewRef): void {
    (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
    const view = viewRef as InternalViewRef<unknown>;
    this._views.push(view);
    view.attachToAppRef(this);
  }

  /**
   * Detaches a view from dirty checking again.
   */
  detachView(viewRef: ViewRef): void {
    (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
    const view = viewRef as InternalViewRef<unknown>;
    remove(this._views, view);
    view.detachFromAppRef();
  }

  private _loadComponent(componentRef: ComponentRef<any>): void {
    this.attachView(componentRef.hostView);
    try {
      this.tick();
    } catch (e) {
      this.internalErrorHandler(e);
    }
    this.components.push(componentRef);
    // Get the listeners lazily to prevent DI cycles.
    const listeners = this._injector.get(APP_BOOTSTRAP_LISTENER, []);
    if (ngDevMode && !Array.isArray(listeners)) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_MULTI_PROVIDER,
        'Unexpected type of the `APP_BOOTSTRAP_LISTENER` token value ' +
          `(expected an array, but got ${typeof listeners}). ` +
          'Please check that the `APP_BOOTSTRAP_LISTENER` token is configured as a ' +
          '`multi: true` provider.',
      );
    }
    listeners.forEach((listener) => listener(componentRef));
  }

  /** @internal */
  ngOnDestroy() {
    if (this._destroyed) return;

    try {
      // Call all the lifecycle hooks.
      this._destroyListeners.forEach((listener) => listener());

      // Destroy all registered views.
      this._views.slice().forEach((view) => view.destroy());
    } finally {
      // Indicate that this instance is destroyed.
      this._destroyed = true;

      // Release all references.
      this._views = [];
      this._destroyListeners = [];
    }
  }

  /**
   * Registers a listener to be called when an instance is destroyed.
   *
   * @param callback A callback function to add as a listener.
   * @returns A function which unregisters a listener.
   */
  onDestroy(callback: () => void): VoidFunction {
    (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
    this._destroyListeners.push(callback);
    return () => remove(this._destroyListeners, callback);
  }

  /**
   * Destroys an Angular application represented by this `ApplicationRef`. Calling this function
   * will destroy the associated environment injectors as well as all the bootstrapped components
   * with their views.
   */
  destroy(): void {
    if (this._destroyed) {
      throw new RuntimeError(
        RuntimeErrorCode.APPLICATION_REF_ALREADY_DESTROYED,
        ngDevMode && 'This instance of the `ApplicationRef` has already been destroyed.',
      );
    }

    const injector = this._injector as R3Injector;

    // Check that this injector instance supports destroy operation.
    if (injector.destroy && !injector.destroyed) {
      // Destroying an underlying injector will trigger the `ngOnDestroy` lifecycle
      // hook, which invokes the remaining cleanup actions.
      injector.destroy();
    }
  }

  /**
   * Returns the number of attached views.
   */
  get viewCount() {
    return this._views.length;
  }
}

function warnIfDestroyed(destroyed: boolean): void {
  if (destroyed) {
    console.warn(
      formatRuntimeError(
        RuntimeErrorCode.APPLICATION_REF_ALREADY_DESTROYED,
        'This instance of the `ApplicationRef` has already been destroyed.',
      ),
    );
  }
}

export function remove<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}

export const enum ApplicationRefDirtyFlags {
  None = 0,

  /**
   * A global change detection round has been requested.
   */
  ViewTreeGlobal = 0b00000001,

  /**
   * Part of the view tree is marked for traversal.
   */
  ViewTreeTraversal = 0b00000010,

  /**
   * Part of the view tree is marked to be checked (dirty).
   */
  ViewTreeCheck = 0b00000100,

  /**
   * Helper for any view tree bit being set.
   */
  ViewTreeAny = ViewTreeGlobal | ViewTreeTraversal | ViewTreeCheck,

  /**
   * After render hooks need to run.
   */
  AfterRender = 0b00001000,

  /**
   * Effects at the `ApplicationRef` level.
   */
  RootEffects = 0b00010000,
}
