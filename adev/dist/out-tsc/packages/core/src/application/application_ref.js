/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import '../util/ng_hmr_mode';
import '../util/ng_jit_mode';
import '../util/ng_server_mode';
import {
  setActiveConsumer,
  getActiveConsumer,
  setThrowInvalidWriteToSignalError,
} from '../../primitives/signals';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {ZONELESS_ENABLED} from '../change_detection/scheduling/zoneless_scheduling';
import {Console} from '../console';
import {inject} from '../di';
import {Injectable} from '../di/injectable';
import {InjectionToken} from '../di/injection_token';
import {Injector} from '../di/injector';
import {EnvironmentInjector} from '../di/r3_injector';
import {formatRuntimeError, RuntimeError} from '../errors';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from '../error_handler';
import {ComponentFactory} from '../linker/component_factory';
import {ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {NgModuleRef} from '../linker/ng_module_factory';
import {PendingTasksInternal} from '../pending_tasks_internal';
import {RendererFactory2} from '../render/api';
import {AfterRenderManager} from '../render3/after_render/manager';
import {isStandalone} from '../render3/def_getters';
import {detectChangesInternal} from '../render3/instructions/change_detection';
import {publishDefaultGlobalUtils as _publishDefaultGlobalUtils} from '../render3/util/global_utils';
import {requiresRefreshOrTraversal} from '../render3/util/view_utils';
import {TESTABILITY} from '../testability/testability';
import {NgZone} from '../zone/ng_zone';
import {profiler} from '../render3/profiler';
import {EffectScheduler} from '../render3/reactivity/root_effect_scheduler';
import {isReactiveLViewConsumer} from '../render3/reactive_lview_consumer';
import {ApplicationInitStatus} from './application_init';
import {TracingAction, TracingService} from './tracing';
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
export const APP_BOOTSTRAP_LISTENER = new InjectionToken(ngDevMode ? 'appBootstrapListener' : '');
export function publishDefaultGlobalUtils() {
  ngDevMode && _publishDefaultGlobalUtils();
}
/**
 * Sets the error for an invalid write to a signal to be an Angular `RuntimeError`.
 */
export function publishSignalConfiguration() {
  setThrowInvalidWriteToSignalError(() => {
    let errorMessage = '';
    if (ngDevMode) {
      const activeConsumer = getActiveConsumer();
      errorMessage =
        activeConsumer && isReactiveLViewConsumer(activeConsumer)
          ? 'Writing to signals is not allowed while Angular renders the template (eg. interpolations)'
          : 'Writing to signals is not allowed in a `computed`';
    }
    throw new RuntimeError(
      600 /* RuntimeErrorCode.SIGNAL_WRITE_FROM_ILLEGAL_CONTEXT */,
      errorMessage,
    );
  });
}
export function isBoundToModule(cf) {
  return cf.isBoundToModule;
}
/** Maximum number of times ApplicationRef will refresh all attached views in a single tick. */
const MAXIMUM_REFRESH_RERUNS = 10;
export function optionsReducer(dst, objs) {
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
let ApplicationRef = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ApplicationRef = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ApplicationRef = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /** @internal */
    _runningTick = false;
    _destroyed = false;
    _destroyListeners = [];
    /** @internal */
    _views = [];
    internalErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
    afterRenderManager = inject(AfterRenderManager);
    zonelessEnabled = inject(ZONELESS_ENABLED);
    rootEffectScheduler = inject(EffectScheduler);
    /**
     * Current dirty state of the application across a number of dimensions (views, afterRender hooks,
     * etc).
     *
     * A flag set here means that `tick()` will attempt to resolve the dirtiness when executed.
     *
     * @internal
     */
    dirtyFlags = 0 /* ApplicationRefDirtyFlags.None */;
    /**
     * Most recent snapshot from the `TracingService`, if any.
     *
     * This snapshot attempts to capture the context when `tick()` was first
     * scheduled. It then runs wrapped in this context.
     *
     * @internal
     */
    tracingSnapshot = null;
    // Needed for ComponentFixture temporarily during migration of autoDetect behavior
    // Eventually the hostView of the fixture should just attach to ApplicationRef.
    allTestViews = new Set();
    autoDetectTestViews = new Set();
    includeAllTestViews = false;
    /** @internal */
    afterTick = new Subject();
    /** @internal */
    get allViews() {
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
    componentTypes = [];
    /**
     * Get a list of components registered to this application.
     */
    components = [];
    internalPendingTask = inject(PendingTasksInternal);
    /**
     * Returns an Observable that indicates when the application is stable or unstable.
     */
    get isStable() {
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
    whenStable() {
      let subscription;
      return new Promise((resolve) => {
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
    _injector = inject(EnvironmentInjector);
    _rendererFactory = null;
    /**
     * The `EnvironmentInjector` used to create this application.
     */
    get injector() {
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
    bootstrap(componentOrFactory, rootSelectorOrNode) {
      return this.bootstrapImpl(componentOrFactory, rootSelectorOrNode);
    }
    bootstrapImpl(componentOrFactory, rootSelectorOrNode, injector = Injector.NULL) {
      const ngZone = this._injector.get(NgZone);
      return ngZone.run(() => {
        profiler(10 /* ProfilerEvent.BootstrapComponentStart */);
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
          throw new RuntimeError(
            405 /* RuntimeErrorCode.ASYNC_INITIALIZERS_STILL_RUNNING */,
            errorMessage,
          );
        }
        let componentFactory;
        if (isComponentFactory) {
          componentFactory = componentOrFactory;
        } else {
          const resolver = this._injector.get(ComponentFactoryResolver);
          componentFactory = resolver.resolveComponentFactory(componentOrFactory);
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
        profiler(11 /* ProfilerEvent.BootstrapComponentEnd */, compRef);
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
    tick() {
      if (!this.zonelessEnabled) {
        this.dirtyFlags |= 1 /* ApplicationRefDirtyFlags.ViewTreeGlobal */;
      }
      this._tick();
    }
    /** @internal */
    _tick() {
      profiler(12 /* ProfilerEvent.ChangeDetectionStart */);
      if (this.tracingSnapshot !== null) {
        // Ensure we always run `tickImpl()` in the context of the most recent snapshot,
        // if one exists. Snapshots may be reference counted by the implementation so
        // we want to ensure that if we request a snapshot that we use it.
        this.tracingSnapshot.run(TracingAction.CHANGE_DETECTION, this.tickImpl);
      } else {
        this.tickImpl();
      }
    }
    tickImpl = () => {
      (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
      if (this._runningTick) {
        throw new RuntimeError(
          101 /* RuntimeErrorCode.RECURSIVE_APPLICATION_REF_TICK */,
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
        profiler(13 /* ProfilerEvent.ChangeDetectionEnd */);
      }
    };
    /**
     * Performs the core work of synchronizing the application state with the UI, resolving any
     * pending dirtiness (potentially in a loop).
     */
    synchronize() {
      if (this._rendererFactory === null && !this._injector.destroyed) {
        this._rendererFactory = this._injector.get(RendererFactory2, null, {optional: true});
      }
      let runs = 0;
      while (
        this.dirtyFlags !== 0 /* ApplicationRefDirtyFlags.None */ &&
        runs++ < MAXIMUM_REFRESH_RERUNS
      ) {
        profiler(14 /* ProfilerEvent.ChangeDetectionSyncStart */);
        this.synchronizeOnce();
        profiler(15 /* ProfilerEvent.ChangeDetectionSyncEnd */);
      }
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && runs >= MAXIMUM_REFRESH_RERUNS) {
        throw new RuntimeError(
          103 /* RuntimeErrorCode.INFINITE_CHANGE_DETECTION */,
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
    synchronizeOnce() {
      // First, process any dirty root effects.
      if (this.dirtyFlags & 16 /* ApplicationRefDirtyFlags.RootEffects */) {
        this.dirtyFlags &= ~16 /* ApplicationRefDirtyFlags.RootEffects */;
        this.rootEffectScheduler.flush();
      }
      // First check dirty views, if there are any.
      let ranDetectChanges = false;
      if (this.dirtyFlags & 7 /* ApplicationRefDirtyFlags.ViewTreeAny */) {
        // Change detection on views starts in targeted mode (only check components if they're
        // marked as dirty) unless global checking is specifically requested via APIs like
        // `ApplicationRef.tick()` and the `NgZone` integration.
        const useGlobalCheck = Boolean(
          this.dirtyFlags & 1 /* ApplicationRefDirtyFlags.ViewTreeGlobal */,
        );
        // Clear the view-related dirty flags.
        this.dirtyFlags &= ~7 /* ApplicationRefDirtyFlags.ViewTreeAny */;
        // Set the AfterRender bit, as we're checking views and will need to run afterRender hooks.
        this.dirtyFlags |= 8 /* ApplicationRefDirtyFlags.AfterRender */;
        // Check all potentially dirty views.
        for (let {_lView} of this.allViews) {
          // When re-checking, only check views which actually need it.
          if (!useGlobalCheck && !requiresRefreshOrTraversal(_lView)) {
            continue;
          }
          const mode =
            useGlobalCheck && !this.zonelessEnabled
              ? // Global mode includes `CheckAlways` views.
                0 /* ChangeDetectionMode.Global */
              : // Only refresh views with the `RefreshView` flag or views is a changed signal
                1; /* ChangeDetectionMode.Targeted */
          detectChangesInternal(_lView, mode);
          ranDetectChanges = true;
        }
        // If `markForCheck()` was called during view checking, it will have set the `ViewTreeCheck`
        // flag. We clear the flag here because, for backwards compatibility, `markForCheck()`
        // during view checking doesn't cause the view to be re-checked.
        this.dirtyFlags &= ~4 /* ApplicationRefDirtyFlags.ViewTreeCheck */;
        // Check if any views are still dirty after checking and we need to loop back.
        this.syncDirtyFlagsWithViews();
        if (
          this.dirtyFlags &
          (7 /* ApplicationRefDirtyFlags.ViewTreeAny */ |
            16) /* ApplicationRefDirtyFlags.RootEffects */
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
      if (this.dirtyFlags & 8 /* ApplicationRefDirtyFlags.AfterRender */) {
        this.dirtyFlags &= ~8 /* ApplicationRefDirtyFlags.AfterRender */;
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
    syncDirtyFlagsWithViews() {
      if (this.allViews.some(({_lView}) => requiresRefreshOrTraversal(_lView))) {
        // If after running all afterRender callbacks new views are dirty, ensure we loop back.
        this.dirtyFlags |= 2 /* ApplicationRefDirtyFlags.ViewTreeTraversal */;
        return;
      } else {
        // Even though this flag may be set, none of _our_ views require traversal, and so the
        // `ApplicationRef` doesn't require any repeated checking.
        this.dirtyFlags &= ~7 /* ApplicationRefDirtyFlags.ViewTreeAny */;
      }
    }
    /**
     * Attaches a view so that it will be dirty checked.
     * The view will be automatically detached when it is destroyed.
     * This will throw if the view is already attached to a ViewContainer.
     */
    attachView(viewRef) {
      (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
      const view = viewRef;
      this._views.push(view);
      view.attachToAppRef(this);
    }
    /**
     * Detaches a view from dirty checking again.
     */
    detachView(viewRef) {
      (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
      const view = viewRef;
      remove(this._views, view);
      view.detachFromAppRef();
    }
    _loadComponent(componentRef) {
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
          -209 /* RuntimeErrorCode.INVALID_MULTI_PROVIDER */,
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
    onDestroy(callback) {
      (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
      this._destroyListeners.push(callback);
      return () => remove(this._destroyListeners, callback);
    }
    /**
     * Destroys an Angular application represented by this `ApplicationRef`. Calling this function
     * will destroy the associated environment injectors as well as all the bootstrapped components
     * with their views.
     */
    destroy() {
      if (this._destroyed) {
        throw new RuntimeError(
          406 /* RuntimeErrorCode.APPLICATION_REF_ALREADY_DESTROYED */,
          ngDevMode && 'This instance of the `ApplicationRef` has already been destroyed.',
        );
      }
      const injector = this._injector;
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
  };
  return (ApplicationRef = _classThis);
})();
export {ApplicationRef};
function warnIfDestroyed(destroyed) {
  if (destroyed) {
    console.warn(
      formatRuntimeError(
        406 /* RuntimeErrorCode.APPLICATION_REF_ALREADY_DESTROYED */,
        'This instance of the `ApplicationRef` has already been destroyed.',
      ),
    );
  }
}
export function remove(list, el) {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
//# sourceMappingURL=application_ref.js.map
