/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  SIGNAL,
  consumerDestroy,
  isInNotificationPhase,
  setActiveConsumer,
  BASE_EFFECT_NODE,
  runEffect,
} from '../../../primitives/signals';
import {FLAGS, EFFECTS} from '../interfaces/view';
import {markAncestorsForTraversal} from '../util/view_utils';
import {inject} from '../../di/injector_compatibility';
import {Injector} from '../../di/injector';
import {assertNotInReactiveContext} from './asserts';
import {assertInInjectionContext} from '../../di/contextual';
import {DestroyRef, NodeInjectorDestroyRef} from '../../linker/destroy_ref';
import {ViewContext} from '../view_context';
import {noop} from '../../util/noop';
import {ChangeDetectionScheduler} from '../../change_detection/scheduling/zoneless_scheduling';
import {setIsRefreshingViews} from '../state';
import {EffectScheduler} from './root_effect_scheduler';
import {emitEffectCreatedEvent, setInjectorProfilerContext} from '../debug/injector_profiler';
export class EffectRefImpl {
  constructor(node) {
    this[SIGNAL] = node;
  }
  destroy() {
    this[SIGNAL].destroy();
  }
}
/**
 * Registers an "effect" that will be scheduled & executed whenever the signals that it reads
 * changes.
 *
 * Angular has two different kinds of effect: component effects and root effects. Component effects
 * are created when `effect()` is called from a component, directive, or within a service of a
 * component/directive. Root effects are created when `effect()` is called from outside the
 * component tree, such as in a root service.
 *
 * The two effect types differ in their timing. Component effects run as a component lifecycle
 * event during Angular's synchronization (change detection) process, and can safely read input
 * signals or create/destroy views that depend on component state. Root effects run as microtasks
 * and have no connection to the component tree or change detection.
 *
 * `effect()` must be run in injection context, unless the `injector` option is manually specified.
 *
 * @publicApi 20.0
 */
export function effect(effectFn, options) {
  ngDevMode &&
    assertNotInReactiveContext(
      effect,
      'Call `effect` outside of a reactive context. For example, schedule the ' +
        'effect inside the component constructor.',
    );
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(effect);
  }
  if (ngDevMode && options?.allowSignalWrites !== undefined) {
    console.warn(
      `The 'allowSignalWrites' flag is deprecated and no longer impacts effect() (writes are always allowed)`,
    );
  }
  const injector = options?.injector ?? inject(Injector);
  let destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;
  let node;
  const viewContext = injector.get(ViewContext, null, {optional: true});
  const notifier = injector.get(ChangeDetectionScheduler);
  if (viewContext !== null) {
    // This effect was created in the context of a view, and will be associated with the view.
    node = createViewEffect(viewContext.view, notifier, effectFn);
    if (destroyRef instanceof NodeInjectorDestroyRef && destroyRef._lView === viewContext.view) {
      // The effect is being created in the same view as the `DestroyRef` references, so it will be
      // automatically destroyed without the need for an explicit `DestroyRef` registration.
      destroyRef = null;
    }
  } else {
    // This effect was created outside the context of a view, and will be scheduled independently.
    node = createRootEffect(effectFn, injector.get(EffectScheduler), notifier);
  }
  node.injector = injector;
  if (destroyRef !== null) {
    // If we need to register for cleanup, do that here.
    node.onDestroyFn = destroyRef.onDestroy(() => node.destroy());
  }
  const effectRef = new EffectRefImpl(node);
  if (ngDevMode) {
    node.debugName = options?.debugName ?? '';
    const prevInjectorProfilerContext = setInjectorProfilerContext({injector, token: null});
    try {
      emitEffectCreatedEvent(effectRef);
    } finally {
      setInjectorProfilerContext(prevInjectorProfilerContext);
    }
  }
  return effectRef;
}
export const EFFECT_NODE = /* @__PURE__ */ (() => ({
  ...BASE_EFFECT_NODE,
  cleanupFns: undefined,
  zone: null,
  onDestroyFn: noop,
  run() {
    if (ngDevMode && isInNotificationPhase()) {
      throw new Error(`Schedulers cannot synchronously execute watches while scheduling.`);
    }
    // We clear `setIsRefreshingViews` so that `markForCheck()` within the body of an effect will
    // cause CD to reach the component in question.
    const prevRefreshingViews = setIsRefreshingViews(false);
    try {
      runEffect(this);
    } finally {
      setIsRefreshingViews(prevRefreshingViews);
    }
  },
  cleanup() {
    if (!this.cleanupFns?.length) {
      return;
    }
    const prevConsumer = setActiveConsumer(null);
    try {
      // Attempt to run the cleanup functions. Regardless of failure or success, we consider
      // cleanup "completed" and clear the list for the next run of the effect. Note that an error
      // from the cleanup function will still crash the current run of the effect.
      while (this.cleanupFns.length) {
        this.cleanupFns.pop()();
      }
    } finally {
      this.cleanupFns = [];
      setActiveConsumer(prevConsumer);
    }
  },
}))();
export const ROOT_EFFECT_NODE = /* @__PURE__ */ (() => ({
  ...EFFECT_NODE,
  consumerMarkedDirty() {
    this.scheduler.schedule(this);
    this.notifier.notify(12 /* NotificationSource.RootEffect */);
  },
  destroy() {
    consumerDestroy(this);
    this.onDestroyFn();
    this.cleanup();
    this.scheduler.remove(this);
  },
}))();
export const VIEW_EFFECT_NODE = /* @__PURE__ */ (() => ({
  ...EFFECT_NODE,
  consumerMarkedDirty() {
    this.view[FLAGS] |= 8192 /* LViewFlags.HasChildViewsToRefresh */;
    markAncestorsForTraversal(this.view);
    this.notifier.notify(13 /* NotificationSource.ViewEffect */);
  },
  destroy() {
    consumerDestroy(this);
    this.onDestroyFn();
    this.cleanup();
    this.view[EFFECTS]?.delete(this);
  },
}))();
export function createViewEffect(view, notifier, fn) {
  const node = Object.create(VIEW_EFFECT_NODE);
  node.view = view;
  node.zone = typeof Zone !== 'undefined' ? Zone.current : null;
  node.notifier = notifier;
  node.fn = createEffectFn(node, fn);
  view[EFFECTS] ?? (view[EFFECTS] = new Set());
  view[EFFECTS].add(node);
  node.consumerMarkedDirty(node);
  return node;
}
export function createRootEffect(fn, scheduler, notifier) {
  const node = Object.create(ROOT_EFFECT_NODE);
  node.fn = createEffectFn(node, fn);
  node.scheduler = scheduler;
  node.notifier = notifier;
  node.zone = typeof Zone !== 'undefined' ? Zone.current : null;
  node.scheduler.add(node);
  node.notifier.notify(12 /* NotificationSource.RootEffect */);
  return node;
}
function createEffectFn(node, fn) {
  return () => {
    fn((cleanupFn) => (node.cleanupFns ?? (node.cleanupFns = [])).push(cleanupFn));
  };
}
//# sourceMappingURL=effect.js.map
