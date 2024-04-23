/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionScheduler, NotificationSource} from '../change_detection/scheduling/zoneless_scheduling';
import {assertInInjectionContext, Injector, runInInjectionContext, ɵɵdefineInjectable} from '../di';
import {inject} from '../di/injector_compatibility';
import {ErrorHandler} from '../error_handler';
import {DestroyRef} from '../linker/destroy_ref';
import {assertNotInReactiveContext} from '../render3/reactivity/asserts';
import {performanceMarkFeature} from '../util/performance';
import {NgZone} from '../zone/ng_zone';

import {isPlatformBrowser} from './util/misc_utils';

/**
 * The phase to run an `afterRender` or `afterNextRender` callback in.
 *
 * Callbacks in the same phase run in the order they are registered. Phases run in the
 * following order after each render:
 *
 *   1. `AfterRenderPhase.EarlyRead`
 *   2. `AfterRenderPhase.Write`
 *   3. `AfterRenderPhase.MixedReadWrite`
 *   4. `AfterRenderPhase.Read`
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * @developerPreview
 */
export enum AfterRenderPhase {
  /**
   * Use `AfterRenderPhase.EarlyRead` for callbacks that only need to **read** from the
   * DOM before a subsequent `AfterRenderPhase.Write` callback, for example to perform
   * custom layout that the browser doesn't natively support. **Never** use this phase
   * for callbacks that can write to the DOM or when `AfterRenderPhase.Read` is adequate.
   *
   * <div class="alert is-important">
   *
   * Using this value can degrade performance.
   * Instead, prefer using built-in browser functionality when possible.
   *
   * </div>
   */
  EarlyRead,

  /**
   * Use `AfterRenderPhase.Write` for callbacks that only **write** to the DOM. **Never**
   * use this phase for callbacks that can read from the DOM.
   */
  Write,

  /**
   * Use `AfterRenderPhase.MixedReadWrite` for callbacks that read from or write to the
   * DOM, that haven't been refactored to use a different phase. **Never** use this phase
   * for callbacks that can use a different phase instead.
   *
   * <div class="alert is-critical">
   *
   * Using this value can **significantly** degrade performance.
   * Instead, prefer refactoring into multiple callbacks using a more specific phase.
   *
   * </div>
   */
  MixedReadWrite,

  /**
   * Use `AfterRenderPhase.Read` for callbacks that only **read** from the DOM. **Never**
   * use this phase for callbacks that can write to the DOM.
   */
  Read,
}

/**
 * Options passed to `afterRender` and `afterNextRender`.
 *
 * @developerPreview
 */
export interface AfterRenderOptions {
  /**
   * The `Injector` to use during creation.
   *
   * If this is not provided, the current injection context will be used instead (via `inject`).
   */
  injector?: Injector;

  /**
   * The phase the callback should be invoked in.
   *
   * <div class="alert is-critical">
   *
   * Defaults to `AfterRenderPhase.MixedReadWrite`. You should choose a more specific
   * phase instead. See `AfterRenderPhase` for more information.
   *
   * </div>
   */
  phase?: AfterRenderPhase;
}

/**
 * A callback that runs after render.
 *
 * @developerPreview
 */
export interface AfterRenderRef {
  /**
   * Shut down the callback, preventing it from being called again.
   */
  destroy(): void;
}

/**
 * Options passed to `internalAfterNextRender`.
 */
export interface InternalAfterNextRenderOptions {
  /**
   * The `Injector` to use during creation.
   *
   * If this is not provided, the current injection context will be used instead (via `inject`).
   */
  injector?: Injector;
  /**
   * When true, the hook will execute both on client and on the server.
   *
   * When false or undefined, the hook only executes in the browser.
   */
  runOnServer?: boolean;
}

/** `AfterRenderRef` that does nothing. */
const NOOP_AFTER_RENDER_REF: AfterRenderRef = {
  destroy() {}
};

/**
 * Register a callback to run once before any userspace `afterRender` or
 * `afterNextRender` callbacks.
 *
 * This function should almost always be used instead of `afterRender` or
 * `afterNextRender` for implementing framework functionality. Consider:
 *
 *   1.) `AfterRenderPhase.EarlyRead` is intended to be used for implementing
 *       custom layout. If the framework itself mutates the DOM after *any*
 *       `AfterRenderPhase.EarlyRead` callbacks are run, the phase can no
 *       longer reliably serve its purpose.
 *
 *   2.) Importing `afterRender` in the framework can reduce the ability for it
 *       to be tree-shaken, and the framework shouldn't need much of the behavior.
 */
export function internalAfterNextRender(
    callback: VoidFunction, options?: InternalAfterNextRenderOptions) {
  const injector = options?.injector ?? inject(Injector);

  // Similarly to the public `afterNextRender` function, an internal one
  // is only invoked in a browser as long as the runOnServer option is not set.
  if (!options?.runOnServer && !isPlatformBrowser(injector)) return;

  const afterRenderEventManager = injector.get(AfterRenderEventManager);
  afterRenderEventManager.internalCallbacks.push(callback);
}

/**
 * Register a callback to be invoked each time the application
 * finishes rendering.
 *
 * <div class="alert is-critical">
 *
 * You should always explicitly specify a non-default [phase](api/core/AfterRenderPhase), or you
 * risk significant performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - once per render
 * - on browser platforms only
 *
 * <div class="alert is-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 *
 * @usageNotes
 *
 * Use `afterRender` to read or write the DOM after each render.
 *
 * ### Example
 * ```ts
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<span #content>{{ ... }}</span>`,
 * })
 * export class MyComponent {
 *   @ViewChild('content') contentRef: ElementRef;
 *
 *   constructor() {
 *     afterRender(() => {
 *       console.log('content height: ' + this.contentRef.nativeElement.scrollHeight);
 *     }, {phase: AfterRenderPhase.Read});
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterRender(callback: VoidFunction, options?: AfterRenderOptions): AfterRenderRef {
  ngDevMode &&
      assertNotInReactiveContext(
          afterRender,
          'Call `afterRender` outside of a reactive context. For example, schedule the render ' +
              'callback inside the component constructor`.');

  !options && assertInInjectionContext(afterRender);
  const injector = options?.injector ?? inject(Injector);

  if (!isPlatformBrowser(injector)) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterRender');

  const afterRenderEventManager = injector.get(AfterRenderEventManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterRender` and `afterNextRender` aren't used.
  const callbackHandler = afterRenderEventManager.handler ??= new AfterRenderCallbackHandlerImpl();
  const phase = options?.phase ?? AfterRenderPhase.MixedReadWrite;
  const destroy = () => {
    callbackHandler.unregister(instance);
    unregisterFn();
  };
  const unregisterFn = injector.get(DestroyRef).onDestroy(destroy);
  const instance = runInInjectionContext(injector, () => new AfterRenderCallback(phase, callback));

  callbackHandler.register(instance);
  return {destroy};
}

/**
 * Register a callback to be invoked the next time the application
 * finishes rendering.
 *
 * <div class="alert is-critical">
 *
 * You should always explicitly specify a non-default [phase](api/core/AfterRenderPhase), or you
 * risk significant performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - on browser platforms only
 *
 * <div class="alert is-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 *
 * @usageNotes
 *
 * Use `afterNextRender` to read or write the DOM once,
 * for example to initialize a non-Angular library.
 *
 * ### Example
 * ```ts
 * @Component({
 *   selector: 'my-chart-cmp',
 *   template: `<div #chart>{{ ... }}</div>`,
 * })
 * export class MyChartCmp {
 *   @ViewChild('chart') chartRef: ElementRef;
 *   chart: MyChart|null;
 *
 *   constructor() {
 *     afterNextRender(() => {
 *       this.chart = new MyChart(this.chartRef.nativeElement);
 *     }, {phase: AfterRenderPhase.Write});
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterNextRender(
    callback: VoidFunction, options?: AfterRenderOptions): AfterRenderRef {
  !options && assertInInjectionContext(afterNextRender);
  const injector = options?.injector ?? inject(Injector);

  if (!isPlatformBrowser(injector)) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterNextRender');

  const afterRenderEventManager = injector.get(AfterRenderEventManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterRender` and `afterNextRender` aren't used.
  const callbackHandler = afterRenderEventManager.handler ??= new AfterRenderCallbackHandlerImpl();
  const phase = options?.phase ?? AfterRenderPhase.MixedReadWrite;
  const destroy = () => {
    callbackHandler.unregister(instance);
    unregisterFn();
  };
  const unregisterFn = injector.get(DestroyRef).onDestroy(destroy);
  const instance = runInInjectionContext(injector, () => new AfterRenderCallback(phase, () => {
                                                     destroy();
                                                     callback();
                                                   }));

  callbackHandler.register(instance);
  return {destroy};
}

/**
 * A wrapper around a function to be used as an after render callback.
 */
class AfterRenderCallback {
  private errorHandler = inject(ErrorHandler, {optional: true});

  constructor(readonly phase: AfterRenderPhase, private callbackFn: VoidFunction) {
    // Registering a callback will notify the scheduler.
    inject(ChangeDetectionScheduler, {optional: true})?.notify(NotificationSource.NewRenderHook);
  }

  invoke() {
    try {
      this.callbackFn();
    } catch (err) {
      this.errorHandler?.handleError(err);
    }
  }
}

/**
 * Implements `afterRender` and `afterNextRender` callback handler logic.
 */
interface AfterRenderCallbackHandler {
  /**
   * Register a new callback.
   */
  register(callback: AfterRenderCallback): void;

  /**
   * Unregister an existing callback.
   */
  unregister(callback: AfterRenderCallback): void;

  /**
   * Execute callbacks. Returns `true` if any callbacks were executed.
   */
  execute(): void;

  /**
   * Perform any necessary cleanup.
   */
  destroy(): void;
}

/**
 * Core functionality for `afterRender` and `afterNextRender`. Kept separate from
 * `AfterRenderEventManager` for tree-shaking.
 */
class AfterRenderCallbackHandlerImpl implements AfterRenderCallbackHandler {
  private executingCallbacks = false;
  private buckets = {
    // Note: the order of these keys controls the order the phases are run.
    [AfterRenderPhase.EarlyRead]: new Set<AfterRenderCallback>(),
    [AfterRenderPhase.Write]: new Set<AfterRenderCallback>(),
    [AfterRenderPhase.MixedReadWrite]: new Set<AfterRenderCallback>(),
    [AfterRenderPhase.Read]: new Set<AfterRenderCallback>(),
  };
  private deferredCallbacks = new Set<AfterRenderCallback>();

  register(callback: AfterRenderCallback): void {
    // If we're currently running callbacks, new callbacks should be deferred
    // until the next render operation.
    const target = this.executingCallbacks ? this.deferredCallbacks : this.buckets[callback.phase];
    target.add(callback);
  }

  unregister(callback: AfterRenderCallback): void {
    this.buckets[callback.phase].delete(callback);
    this.deferredCallbacks.delete(callback);
  }

  execute(): void {
    this.executingCallbacks = true;
    for (const bucket of Object.values(this.buckets)) {
      for (const callback of bucket) {
        callback.invoke();
      }
    }
    this.executingCallbacks = false;

    for (const callback of this.deferredCallbacks) {
      this.buckets[callback.phase].add(callback);
    }
    this.deferredCallbacks.clear();
  }

  destroy(): void {
    for (const bucket of Object.values(this.buckets)) {
      bucket.clear();
    }
    this.deferredCallbacks.clear();
  }
}

/**
 * Implements core timing for `afterRender` and `afterNextRender` events.
 * Delegates to an optional `AfterRenderCallbackHandler` for implementation.
 */
export class AfterRenderEventManager {
  /* @internal */
  handler: AfterRenderCallbackHandler|null = null;

  /* @internal */
  internalCallbacks: VoidFunction[] = [];

  /**
   * Executes internal and user-provided callbacks.
   */
  execute(): void {
    this.executeInternalCallbacks();
    this.handler?.execute();
  }

  executeInternalCallbacks() {
    // Note: internal callbacks power `internalAfterNextRender`. Since internal callbacks
    // are fairly trivial, they are kept separate so that `AfterRenderCallbackHandlerImpl`
    // can still be tree-shaken unless used by the application.
    const callbacks = [...this.internalCallbacks];
    this.internalCallbacks.length = 0;
    for (const callback of callbacks) {
      callback();
    }
  }

  ngOnDestroy() {
    this.handler?.destroy();
    this.handler = null;
    this.internalCallbacks.length = 0;
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: AfterRenderEventManager,
    providedIn: 'root',
    factory: () => new AfterRenderEventManager(),
  });
}
