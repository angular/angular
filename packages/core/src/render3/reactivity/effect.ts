/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  REACTIVE_NODE,
  ReactiveNode,
  SIGNAL,
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerDestroy,
  consumerPollProducersForChange,
  isInNotificationPhase,
} from '@angular/core/primitives/signals';
import {FLAGS, LViewFlags, LView, EFFECTS} from '../interfaces/view';
import {markAncestorsForTraversal} from '../util/view_utils';
import {InjectionToken} from '../../di/injection_token';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {PendingTasks} from '../../pending_tasks';
import {inject} from '../../di/injector_compatibility';
import {performanceMarkFeature} from '../../util/performance';
import {Injector} from '../../di/injector';
import {assertNotInReactiveContext} from './asserts';
import {assertInInjectionContext} from '../../di/contextual';
import {DestroyRef, NodeInjectorDestroyRef} from '../../linker/destroy_ref';
import {ViewContext} from '../view_context';
import {noop} from '../../util/noop';
import {ErrorHandler} from '../../error_handler';
import {
  ChangeDetectionScheduler,
  NotificationSource,
} from '../../change_detection/scheduling/zoneless_scheduling';

/**
 * A global reactive effect, which can be manually destroyed.
 *
 * @developerPreview
 */
export interface EffectRef {
  /**
   * Shut down the effect, removing it from any upcoming scheduled executions.
   */
  destroy(): void;
}

class EffectRefImpl implements EffectRef {
  [SIGNAL]: EffectNode;

  constructor(node: EffectNode) {
    this[SIGNAL] = node;
  }

  destroy(): void {
    this[SIGNAL].destroy();
  }
}

/**
 * Options passed to the `effect` function.
 *
 * @developerPreview
 */
export interface CreateEffectOptions {
  /**
   * The `Injector` in which to create the effect.
   *
   * If this is not provided, the current [injection context](guide/di/dependency-injection-context)
   * will be used instead (via `inject`).
   */
  injector?: Injector;

  /**
   * Whether the `effect` should require manual cleanup.
   *
   * If this is `false` (the default) the effect will automatically register itself to be cleaned up
   * with the current `DestroyRef`.
   */
  manualCleanup?: boolean;

  /**
   * Always create a root effect (which is scheduled as a microtask) regardless of whether `effect`
   * is called within a component.
   */
  forceRoot?: true;

  /**
   * @deprecated no longer required, signal writes are allowed by default.
   */
  allowSignalWrites?: boolean;
}

/**
 * An effect can, optionally, register a cleanup function. If registered, the cleanup is executed
 * before the next effect run. The cleanup function makes it possible to "cancel" any work that the
 * previous effect run might have started.
 *
 * @developerPreview
 */
export type EffectCleanupFn = () => void;

/**
 * A callback passed to the effect function that makes it possible to register cleanup logic.
 *
 * @developerPreview
 */
export type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;

/**
 * Registers an "effect" that will be scheduled & executed whenever the signals that it reads
 * changes.
 *
 * Angular has two different kinds of effect: component effects and root effects. Component effects
 * are created when `effect()` is called from a component, directive, or within a service of a
 * component/directive. Root effects are created when `effect()` is called from outside the
 * component tree, such as in a root service, or when the `forceRoot` option is provided.
 *
 * The two effect types differ in their timing. Component effects run as a component lifecycle
 * event during Angular's synchronization (change detection) process, and can safely read input
 * signals or create/destroy views that depend on component state. Root effects run as microtasks
 * and have no connection to the component tree or change detection.
 *
 * `effect()` must be run in injection context, unless the `injector` option is manually specified.
 *
 * @developerPreview
 */
export function effect(
  effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateEffectOptions,
): EffectRef {
  performanceMarkFeature('NgSignals');
  ngDevMode &&
    assertNotInReactiveContext(
      effect,
      'Call `effect` outside of a reactive context. For example, schedule the ' +
        'effect inside the component constructor.',
    );

  if (ngDevMode && options?.allowSignalWrites !== undefined) {
    console.warn(
      `The 'allowSignalWrites' flag is deprecated & longer required for effect() (writes are allowed by default)`,
    );
  }

  !options?.injector && assertInInjectionContext(effect);
  const injector = options?.injector ?? inject(Injector);
  let destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;

  let node: EffectNode;

  const viewContext = injector.get(ViewContext, null, {optional: true});
  if (viewContext !== null && !options?.forceRoot) {
    // This effect was created in the context of a view, and will be associated with the view.
    node = createViewEffect(viewContext.view, effectFn);
    if (destroyRef instanceof NodeInjectorDestroyRef && destroyRef._lView === viewContext.view) {
      // The effect is being created in the same view as the `DestroyRef` references, so it will be
      // automatically destroyed without the need for an explicit `DestroyRef` registration.
      destroyRef = null;
    }
  } else {
    // This effect was created outside the context of a view, and will be scheduled independently.
    node = createRootEffect(
      effectFn,
      injector.get(EffectScheduler),
      injector.get(ChangeDetectionScheduler),
    );
  }
  node.injector = injector;

  if (destroyRef !== null) {
    // If we need to register for cleanup, do that here.
    node.onDestroyFn = destroyRef.onDestroy(() => node.destroy());
  }

  return new EffectRefImpl(node);
}

export interface EffectNode extends ReactiveNode {
  hasRun: boolean;
  zone: ZoneContract | null;
  cleanupFns: EffectCleanupFn[] | undefined;
  injector: Injector;

  onDestroyFn: () => void;
  fn: (cleanupFn: EffectCleanupRegisterFn) => void;
  run(): void;
  destroy(): void;
  maybeCleanup(): void;
}

export interface ViewEffectNode extends EffectNode {
  view: LView;
}

export interface RootEffectNode extends EffectNode {
  scheduler: EffectScheduler;
  notifier: ChangeDetectionScheduler;
}

/**
 * A scheduler which manages the execution of effects.
 */
export abstract class EffectScheduler {
  /**
   * Schedule the given effect to be executed at a later time.
   *
   * It is an error to attempt to execute any effects synchronously during a scheduling operation.
   */
  abstract schedule(e: RootEffectNode): void;

  /**
   * Run any scheduled effects.
   */
  abstract flush(): void;

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: EffectScheduler,
    providedIn: 'root',
    factory: () => new ZoneAwareEffectScheduler(),
  });
}

/**
 * Not public API, which guarantees `EffectScheduler` only ever comes from the application root
 * injector.
 */
export const APP_EFFECT_SCHEDULER = new InjectionToken('', {
  providedIn: 'root',
  factory: () => inject(EffectScheduler),
});

export const BASE_EFFECT_NODE: Omit<EffectNode, 'fn' | 'destroy' | 'injector'> =
  /* @__PURE__ */ (() => ({
    ...REACTIVE_NODE,
    consumerIsAlwaysLive: true,
    consumerAllowSignalWrites: true,
    dirty: true,
    hasRun: false,
    cleanupFns: undefined,
    zone: null,
    onDestroyFn: noop,
    run(this: EffectNode): void {
      this.dirty = false;

      if (ngDevMode && isInNotificationPhase()) {
        throw new Error(`Schedulers cannot synchronously execute watches while scheduling.`);
      }

      if (this.hasRun && !consumerPollProducersForChange(this)) {
        return;
      }
      this.hasRun = true;

      const registerCleanupFn: EffectCleanupRegisterFn = (cleanupFn) =>
        (this.cleanupFns ??= []).push(cleanupFn);

      const prevNode = consumerBeforeComputation(this);
      try {
        this.maybeCleanup();
        this.fn(registerCleanupFn);
      } catch (err: unknown) {
        // We inject the error handler lazily, to prevent circular dependencies when an effect is
        // created inside of an ErrorHandler.
        this.injector.get(ErrorHandler, null, {optional: true})?.handleError(err);
      } finally {
        consumerAfterComputation(this, prevNode);
      }
    },

    maybeCleanup(this: EffectNode): void {
      while (this.cleanupFns?.length) {
        this.cleanupFns.pop()!();
      }
    },
  }))();

export const ROOT_EFFECT_NODE: Omit<RootEffectNode, 'fn' | 'scheduler' | 'notifier' | 'injector'> =
  /* @__PURE__ */ (() => ({
    ...BASE_EFFECT_NODE,
    consumerMarkedDirty(this: RootEffectNode) {
      this.scheduler.schedule(this);
      this.notifier.notify(NotificationSource.RootEffect);
    },
    destroy(this: RootEffectNode) {
      consumerDestroy(this);
      this.onDestroyFn();
      this.maybeCleanup();
    },
  }))();

export const VIEW_EFFECT_NODE: Omit<ViewEffectNode, 'fn' | 'view' | 'injector'> =
  /* @__PURE__ */ (() => ({
    ...BASE_EFFECT_NODE,
    consumerMarkedDirty(this: ViewEffectNode): void {
      this.view[FLAGS] |= LViewFlags.HasChildViewsToRefresh;
      markAncestorsForTraversal(this.view);
    },
    destroy(this: ViewEffectNode): void {
      consumerDestroy(this);
      this.onDestroyFn();
      this.maybeCleanup();
      this.view[EFFECTS]?.delete(this);
    },
  }))();

export function createViewEffect(
  view: LView,
  fn: (onCleanup: EffectCleanupRegisterFn) => void,
): ViewEffectNode {
  const node = Object.create(VIEW_EFFECT_NODE) as ViewEffectNode;
  node.view = view;
  node.zone = typeof Zone !== 'undefined' ? Zone.current : null;
  node.fn = fn;

  view[EFFECTS] ??= new Set();
  view[EFFECTS].add(node);

  node.consumerMarkedDirty(node);
  return node;
}

export function createRootEffect(
  fn: (onCleanup: EffectCleanupRegisterFn) => void,
  scheduler: EffectScheduler,
  notifier: ChangeDetectionScheduler,
): RootEffectNode {
  const node = Object.create(ROOT_EFFECT_NODE) as RootEffectNode;
  node.fn = fn;
  node.scheduler = scheduler;
  node.notifier = notifier;
  node.zone = typeof Zone !== 'undefined' ? Zone.current : null;
  node.scheduler.schedule(node);
  node.notifier.notify(NotificationSource.RootEffect);
  return node;
}

export function runEffectsInView(view: LView): void {
  if (view[EFFECTS] === null) {
    return;
  }

  // Since effects can make other effects dirty, we flush them in a loop until there are no more to
  // flush.
  let tryFlushEffects = true;

  while (tryFlushEffects) {
    let foundDirtyEffect = false;
    for (const effect of view[EFFECTS]) {
      if (!effect.dirty) {
        continue;
      }
      foundDirtyEffect = true;

      // `runEffectsInView` is called during change detection, and therefore runs
      // in the Angular zone if it's available.
      if (effect.zone === null || Zone.current === effect.zone) {
        effect.run();
      } else {
        effect.zone.run(() => effect.run());
      }
    }

    // Check if we need to continue flushing. If we didn't find any dirty effects, then there's
    // no need to loop back. Otherwise, check the view to see if it was marked for traversal
    // again. If so, there's a chance that one of the effects we ran caused another effect to
    // become dirty.
    tryFlushEffects = foundDirtyEffect && !!(view[FLAGS] & LViewFlags.HasChildViewsToRefresh);
  }
}

/**
 * A wrapper around `ZoneAwareQueueingScheduler` that schedules flushing via the microtask queue
 * when.
 */
export class ZoneAwareEffectScheduler implements EffectScheduler {
  private queuedEffectCount = 0;
  private queues = new Map<Zone | null, Set<RootEffectNode>>();
  private readonly pendingTasks = inject(PendingTasks);
  private taskId: number | null = null;

  schedule(handle: RootEffectNode): void {
    this.enqueue(handle);

    if (this.taskId === null) {
      this.taskId = this.pendingTasks.add();
    }
  }

  private enqueue(handle: RootEffectNode): void {
    const zone = handle.zone as Zone | null;
    if (!this.queues.has(zone)) {
      this.queues.set(zone, new Set());
    }

    const queue = this.queues.get(zone)!;
    if (queue.has(handle)) {
      return;
    }
    this.queuedEffectCount++;
    queue.add(handle);
  }

  /**
   * Run all scheduled effects.
   *
   * Execution order of effects within the same zone is guaranteed to be FIFO, but there is no
   * ordering guarantee between effects scheduled in different zones.
   */
  flush(): void {
    while (this.queuedEffectCount > 0) {
      for (const [zone, queue] of this.queues) {
        // `zone` here must be defined.
        if (zone === null) {
          this.flushQueue(queue);
        } else {
          zone.run(() => this.flushQueue(queue));
        }
      }
    }

    if (this.taskId !== null) {
      this.pendingTasks.remove(this.taskId);
      this.taskId = null;
    }
  }

  private flushQueue(queue: Set<RootEffectNode>): void {
    for (const handle of queue) {
      queue.delete(handle);
      this.queuedEffectCount--;

      // TODO: what happens if this throws an error?
      handle.run();
    }
  }
}

interface ZoneContract {
  run<T>(fn: () => T): T;
}
