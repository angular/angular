/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionScheduler,
  NotificationSource,
} from '../change_detection/scheduling/zoneless_scheduling';
import {Injector, assertInInjectionContext, runInInjectionContext, ɵɵdefineInjectable} from '../di';
import {inject} from '../di/injector_compatibility';
import {ErrorHandler} from '../error_handler';
import {DestroyRef} from '../linker/destroy_ref';
import {assertNotInReactiveContext} from '../render3/reactivity/asserts';
import {performanceMarkFeature} from '../util/performance';
import {NgZone} from '../zone/ng_zone';

import {isPlatformBrowser} from './util/misc_utils';

/**
 * An argument list containing the first non-never type in the given type array, or an empty
 * argument list if there are no non-never types in the type array.
 */
export type ɵFirstAvailable<T extends unknown[]> = T extends [infer H, ...infer R]
  ? [H] extends [never]
    ? ɵFirstAvailable<R>
    : [H]
  : [];

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
 * @deprecated Specify the phase for your callback to run in by passing a spec-object as the first
 *   parameter to `afterRender` or `afterNextRender` instead of a function.
 */
export enum AfterRenderPhase {
  /**
   * Use `AfterRenderPhase.EarlyRead` for callbacks that only need to **read** from the
   * DOM before a subsequent `AfterRenderPhase.Write` callback, for example to perform
   * custom layout that the browser doesn't natively support. Prefer the
   * `AfterRenderPhase.EarlyRead` phase if reading can wait until after the write phase.
   * **Never** write to the DOM in this phase.
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
   * read from the DOM in this phase.
   */
  Write,

  /**
   * Use `AfterRenderPhase.MixedReadWrite` for callbacks that read from or write to the
   * DOM, that haven't been refactored to use a different phase. **Never** use this phase if
   * it is possible to divide the work among the other phases instead.
   *
   * <div class="alert is-critical">
   *
   * Using this value can **significantly** degrade performance.
   * Instead, prefer dividing work into the appropriate phase callbacks.
   *
   * </div>
   */
  MixedReadWrite,

  /**
   * Use `AfterRenderPhase.Read` for callbacks that only **read** from the DOM. **Never**
   * write to the DOM in this phase.
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
   *
   * @deprecated Specify the phase for your callback to run in by passing a spec-object as the first
   *   parameter to `afterRender` or `afterNextRender` instead of a function.
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
  destroy() {},
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
  callback: VoidFunction,
  options?: InternalAfterNextRenderOptions,
) {
  const injector = options?.injector ?? inject(Injector);

  // Similarly to the public `afterNextRender` function, an internal one
  // is only invoked in a browser as long as the runOnServer option is not set.
  if (!options?.runOnServer && !isPlatformBrowser(injector)) return;

  const afterRenderEventManager = injector.get(AfterRenderEventManager);
  afterRenderEventManager.internalCallbacks.push(callback);
}

/**
 * Register callbacks to be invoked each time the application finishes rendering, during the
 * specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="alert is-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Callbacks run in the following phase order *after each render*:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - Callbacks in the same phase run in the order they are registered.
 * - Callbacks run on browser platforms only, they will not run on the server.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a parameter. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="alert is-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The callback functions to register
 * @param options Options to control the behavior of the callback
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
 *     afterRender({
 *       read: () => {
 *         console.log('content height: ' + this.contentRef.nativeElement.scrollHeight);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterRender<E = never, W = never, M = never>(
  spec: {
    earlyRead?: () => E;
    write?: (...args: ɵFirstAvailable<[E]>) => W;
    mixedReadWrite?: (...args: ɵFirstAvailable<[W, E]>) => M;
    read?: (...args: ɵFirstAvailable<[M, W, E]>) => void;
  },
  options?: Omit<AfterRenderOptions, 'phase'>,
): AfterRenderRef;

/**
 * Register a callback to be invoked each time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="alert is-critical">
 *
 * You should prefer specifying an explicit phase for the callback instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - once per render
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="alert is-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 * @param options Options to control the behavior of the callback
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
 *     afterRender({
 *       read: () => {
 *         console.log('content height: ' + this.contentRef.nativeElement.scrollHeight);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterRender(callback: VoidFunction, options?: AfterRenderOptions): AfterRenderRef;

export function afterRender(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
  options?: AfterRenderOptions,
): AfterRenderRef {
  ngDevMode &&
    assertNotInReactiveContext(
      afterRender,
      'Call `afterRender` outside of a reactive context. For example, schedule the render ' +
        'callback inside the component constructor`.',
    );

  !options && assertInInjectionContext(afterRender);
  const injector = options?.injector ?? inject(Injector);

  if (!isPlatformBrowser(injector)) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterRender');

  return afterRenderImpl(
    callbackOrSpec,
    injector,
    /* once */ false,
    options?.phase ?? AfterRenderPhase.MixedReadWrite,
  );
}

/**
 * Register callbacks to be invoked the next time the application finishes rendering, during the
 * specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="alert is-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Callbacks run in the following phase order *once, after the next render*:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - Callbacks in the same phase run in the order they are registered.
 * - Callbacks run on browser platforms only, they will not run on the server.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a parameter. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="alert is-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The callback functions to register
 * @param options Options to control the behavior of the callback
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
 *     afterNextRender({
 *       write: () => {
 *         this.chart = new MyChart(this.chartRef.nativeElement);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterNextRender<E = never, W = never, M = never>(
  spec: {
    earlyRead?: () => E;
    write?: (...args: ɵFirstAvailable<[E]>) => W;
    mixedReadWrite?: (...args: ɵFirstAvailable<[W, E]>) => M;
    read?: (...args: ɵFirstAvailable<[M, W, E]>) => void;
  },
  options?: Omit<AfterRenderOptions, 'phase'>,
): AfterRenderRef;

/**
 * Register a callback to be invoked the next time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="alert is-critical">
 *
 * You should prefer specifying an explicit phase for the callback instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="alert is-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 * @param options Options to control the behavior of the callback
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
 *     afterNextRender({
 *       write: () => {
 *         this.chart = new MyChart(this.chartRef.nativeElement);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterNextRender(
  callback: VoidFunction,
  options?: AfterRenderOptions,
): AfterRenderRef;

export function afterNextRender(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
  options?: AfterRenderOptions,
): AfterRenderRef {
  !options && assertInInjectionContext(afterNextRender);
  const injector = options?.injector ?? inject(Injector);

  if (!isPlatformBrowser(injector)) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterNextRender');

  return afterRenderImpl(
    callbackOrSpec,
    injector,
    /* once */ true,
    options?.phase ?? AfterRenderPhase.MixedReadWrite,
  );
}

function getSpec(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
  phase: AfterRenderPhase,
) {
  if (callbackOrSpec instanceof Function) {
    switch (phase) {
      case AfterRenderPhase.EarlyRead:
        return {earlyRead: callbackOrSpec};
      case AfterRenderPhase.Write:
        return {write: callbackOrSpec};
      case AfterRenderPhase.MixedReadWrite:
        return {mixedReadWrite: callbackOrSpec};
      case AfterRenderPhase.Read:
        return {read: callbackOrSpec};
    }
  }
  return callbackOrSpec;
}

/**
 * Shared implementation for `afterRender` and `afterNextRender`.
 */
function afterRenderImpl(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
  injector: Injector,
  once: boolean,
  phase: AfterRenderPhase,
): AfterRenderRef {
  const spec = getSpec(callbackOrSpec, phase);
  const afterRenderEventManager = injector.get(AfterRenderEventManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterRender` and `afterNextRender` aren't used.
  const callbackHandler = (afterRenderEventManager.handler ??=
    new AfterRenderCallbackHandlerImpl());

  const pipelinedArgs: [] | [unknown] = [];
  const instances: AfterRenderCallback[] = [];

  const destroy = () => {
    for (const instance of instances) {
      callbackHandler.unregister(instance);
    }
    unregisterFn();
  };
  const unregisterFn = injector.get(DestroyRef).onDestroy(destroy);

  const registerCallback = (
    phase: AfterRenderPhase,
    phaseCallback: undefined | ((...args: unknown[]) => unknown),
  ) => {
    if (!phaseCallback) {
      return;
    }
    const callback = once
      ? (...args: [unknown]) => {
          destroy();
          phaseCallback(...args);
        }
      : phaseCallback;

    const instance = runInInjectionContext(
      injector,
      () => new AfterRenderCallback(phase, pipelinedArgs, callback),
    );
    callbackHandler.register(instance);
    instances.push(instance);
  };

  registerCallback(AfterRenderPhase.EarlyRead, spec.earlyRead);
  registerCallback(AfterRenderPhase.Write, spec.write);
  registerCallback(AfterRenderPhase.MixedReadWrite, spec.mixedReadWrite);
  registerCallback(AfterRenderPhase.Read, spec.read);

  return {destroy};
}

/**
 * A wrapper around a function to be used as an after render callback.
 */
class AfterRenderCallback {
  private zone = inject(NgZone);
  private errorHandler = inject(ErrorHandler, {optional: true});

  constructor(
    readonly phase: AfterRenderPhase,
    private pipelinedArgs: [] | [unknown],
    private callbackFn: (...args: unknown[]) => unknown,
  ) {
    // Registering a callback will notify the scheduler.
    inject(ChangeDetectionScheduler, {optional: true})?.notify(NotificationSource.NewRenderHook);
  }

  invoke() {
    try {
      const result = this.zone.runOutsideAngular(() =>
        this.callbackFn.apply(null, this.pipelinedArgs as [unknown]),
      );
      // Clear out the args and add the result which will be passed to the next phase.
      this.pipelinedArgs.splice(0, this.pipelinedArgs.length, result);
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
  handler: AfterRenderCallbackHandler | null = null;

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
