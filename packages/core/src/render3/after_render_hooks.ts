/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext, Injector, ɵɵdefineInjectable} from '../di';
import {inject} from '../di/injector_compatibility';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {DestroyRef} from '../linker/destroy_ref';
import {assertGreaterThan} from '../util/assert';
import {NgZone} from '../zone';

import {isPlatformBrowser} from './util/misc_utils';

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
 * Register a callback to be invoked each time the application
 * finishes rendering.
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
 *     });
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterRender(callback: VoidFunction, options?: AfterRenderOptions): AfterRenderRef {
  !options && assertInInjectionContext(afterRender);
  const injector = options?.injector ?? inject(Injector);

  if (!isPlatformBrowser(injector)) {
    return {destroy() {}};
  }

  let destroy: VoidFunction|undefined;
  const unregisterFn = injector.get(DestroyRef).onDestroy(() => destroy?.());
  const manager = injector.get(AfterRenderEventManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterRender` and `afterNextRender` aren't used.
  const handler = manager.handler ??= new AfterRenderCallbackHandlerImpl();
  const ngZone = injector.get(NgZone);
  const instance = new AfterRenderCallback(() => ngZone.runOutsideAngular(callback));

  destroy = () => {
    handler.unregister(instance);
    unregisterFn();
  };
  handler.register(instance);
  return {destroy};
}

/**
 * Register a callback to be invoked the next time the application
 * finishes rendering.
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
 *     });
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
    return {destroy() {}};
  }

  let destroy: VoidFunction|undefined;
  const unregisterFn = injector.get(DestroyRef).onDestroy(() => destroy?.());
  const manager = injector.get(AfterRenderEventManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterRender` and `afterNextRender` aren't used.
  const handler = manager.handler ??= new AfterRenderCallbackHandlerImpl();
  const ngZone = injector.get(NgZone);
  const instance = new AfterRenderCallback(() => {
    destroy?.();
    ngZone.runOutsideAngular(callback);
  });

  destroy = () => {
    handler.unregister(instance);
    unregisterFn();
  };
  handler.register(instance);
  return {destroy};
}

/**
 * A wrapper around a function to be used as an after render callback.
 */
class AfterRenderCallback {
  private callback: VoidFunction;

  constructor(callback: VoidFunction) {
    this.callback = callback;
  }

  invoke() {
    this.callback();
  }
}

/**
 * Implements `afterRender` and `afterNextRender` callback handler logic.
 */
interface AfterRenderCallbackHandler {
  /**
   * Validate that it's safe for a render operation to begin,
   * throwing if not. Not guaranteed to be called if a render
   * operation is started before handler was registered.
   */
  validateBegin(): void;

  /**
   * Register a new callback.
   */
  register(callback: AfterRenderCallback): void;

  /**
   * Unregister an existing callback.
   */
  unregister(callback: AfterRenderCallback): void;

  /**
   * Execute callbacks.
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
  private callbacks = new Set<AfterRenderCallback>();
  private deferredCallbacks = new Set<AfterRenderCallback>();

  validateBegin(): void {
    if (this.executingCallbacks) {
      throw new RuntimeError(
          RuntimeErrorCode.RECURSIVE_APPLICATION_RENDER,
          ngDevMode &&
              'A new render operation began before the previous operation ended. ' +
                  'Did you trigger change detection from afterRender or afterNextRender?');
    }
  }

  register(callback: AfterRenderCallback): void {
    // If we're currently running callbacks, new callbacks should be deferred
    // until the next render operation.
    const target = this.executingCallbacks ? this.deferredCallbacks : this.callbacks;
    target.add(callback);
  }

  unregister(callback: AfterRenderCallback): void {
    this.callbacks.delete(callback);
    this.deferredCallbacks.delete(callback);
  }

  execute(): void {
    try {
      this.executingCallbacks = true;
      for (const callback of this.callbacks) {
        callback.invoke();
      }
    } finally {
      this.executingCallbacks = false;
      for (const callback of this.deferredCallbacks) {
        this.callbacks.add(callback);
      }
      this.deferredCallbacks.clear();
    }
  }

  destroy(): void {
    this.callbacks.clear();
    this.deferredCallbacks.clear();
  }
}

/**
 * Implements core timing for `afterRender` and `afterNextRender` events.
 * Delegates to an optional `AfterRenderCallbackHandler` for implementation.
 */
export class AfterRenderEventManager {
  private renderDepth = 0;

  /* @internal */
  handler: AfterRenderCallbackHandler|null = null;

  /**
   * Mark the beginning of a render operation (i.e. CD cycle).
   * Throws if called while executing callbacks.
   */
  begin() {
    this.handler?.validateBegin();
    this.renderDepth++;
  }

  /**
   * Mark the end of a render operation. Callbacks will be
   * executed if there are no more pending operations.
   */
  end() {
    ngDevMode && assertGreaterThan(this.renderDepth, 0, 'renderDepth must be greater than 0');
    this.renderDepth--;

    if (this.renderDepth === 0) {
      this.handler?.execute();
    }
  }

  ngOnDestroy() {
    this.handler?.destroy();
    this.handler = null;
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: AfterRenderEventManager,
    providedIn: 'root',
    factory: () => new AfterRenderEventManager(),
  });
}
