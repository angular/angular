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
  const instance = new AfterRenderCallback(callback);

  destroy = () => {
    manager.unregister(instance);
    unregisterFn();
  };
  manager.register(instance);
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
  const instance = new AfterRenderCallback(() => {
    destroy?.();
    callback();
  });

  destroy = () => {
    manager.unregister(instance);
    unregisterFn();
  };
  manager.register(instance);
  return {destroy};
}

/**
 * A wrapper around a function to be used as an after render callback.
 * @private
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
 * Implements `afterRender` and `afterNextRender` callback manager logic.
 */
export class AfterRenderEventManager {
  private callbacks = new Set<AfterRenderCallback>();
  private deferredCallbacks = new Set<AfterRenderCallback>();
  private renderDepth = 0;
  private runningCallbacks = false;

  /**
   * Mark the beginning of a render operation (i.e. CD cycle).
   * Throws if called from an `afterRender` callback.
   */
  begin() {
    if (this.runningCallbacks) {
      throw new RuntimeError(
          RuntimeErrorCode.RECURSIVE_APPLICATION_RENDER,
          ngDevMode &&
              'A new render operation began before the previous operation ended. ' +
                  'Did you trigger change detection from afterRender or afterNextRender?');
    }

    this.renderDepth++;
  }

  /**
   * Mark the end of a render operation. Registered callbacks
   * are invoked if there are no more pending operations.
   */
  end() {
    this.renderDepth--;

    if (this.renderDepth === 0) {
      try {
        this.runningCallbacks = true;
        for (const callback of this.callbacks) {
          callback.invoke();
        }
      } finally {
        this.runningCallbacks = false;
        for (const callback of this.deferredCallbacks) {
          this.callbacks.add(callback);
        }
        this.deferredCallbacks.clear();
      }
    }
  }

  register(callback: AfterRenderCallback) {
    // If we're currently running callbacks, new callbacks should be deferred
    // until the next render operation.
    const target = this.runningCallbacks ? this.deferredCallbacks : this.callbacks;
    target.add(callback);
  }

  unregister(callback: AfterRenderCallback) {
    this.callbacks.delete(callback);
    this.deferredCallbacks.delete(callback);
  }

  ngOnDestroy() {
    this.callbacks.clear();
    this.deferredCallbacks.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: AfterRenderEventManager,
    providedIn: 'root',
    factory: () => new AfterRenderEventManager(),
  });
}
