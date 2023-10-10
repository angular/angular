/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injector, ɵɵdefineInjectable} from '../../di';
import {NgZone} from '../../zone';

/** Configuration object used to register passive and capturing events. */
const eventListenerOptions: AddEventListenerOptions = {
  passive: true,
  capture: true
};

/** Keeps track of the currently-registered `on hover` triggers. */
const hoverTriggers = new WeakMap<Element, DeferEventEntry>();

/** Keeps track of the currently-registered `on interaction` triggers. */
const interactionTriggers = new WeakMap<Element, DeferEventEntry>();

/** Names of the events considered as interaction events. */
const interactionEventNames = ['click', 'keydown'] as const;

/** Names of the events considered as hover events. */
const hoverEventNames = ['mouseenter', 'focusin'];

/** Object keeping track of registered callbacks for a deferred block trigger. */
class DeferEventEntry {
  callbacks = new Set<() => void>();

  listener = () => {
    for (const callback of this.callbacks) {
      callback();
    }
  }
}

/**
 * Registers an interaction trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is interacted with.
 * @param injector Injector that can be used by the trigger to resolve DI tokens.
 */
export function onInteraction(
    trigger: Element, callback: VoidFunction, injector: Injector): VoidFunction {
  let entry = interactionTriggers.get(trigger);

  // If this is the first entry for this element, add the listeners.
  if (!entry) {
    // Note that using managing events centrally like this lends itself well to using global
    // event delegation. It currently does delegation at the element level, rather than the
    // document level, because:
    // 1. Global delegation is the most effective when there are a lot of events being registered
    // at the same time. Deferred blocks are unlikely to be used in such a way.
    // 2. Matching events to their target isn't free. For each `click` and `keydown` event we
    // would have look through all the triggers and check if the target either is the element
    // itself or it's contained within the element. Given that `click` and `keydown` are some
    // of the most common events, this may end up introducing a lot of runtime overhead.
    // 3. We're still registering only two events per element, no matter how many deferred blocks
    // are referencing it.
    entry = new DeferEventEntry();
    interactionTriggers.set(trigger, entry);

    // Ensure that the handler runs in the NgZone since it gets
    // registered in `afterRender` which runs outside.
    injector.get(NgZone).run(() => {
      for (const name of interactionEventNames) {
        trigger.addEventListener(name, entry!.listener, eventListenerOptions);
      }
    });
  }

  entry.callbacks.add(callback);

  return () => {
    const {callbacks, listener} = entry!;
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      interactionTriggers.delete(trigger);

      for (const name of interactionEventNames) {
        trigger.removeEventListener(name, listener, eventListenerOptions);
      }
    }
  };
}

/**
 * Registers a hover trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is hovered over.
 * @param injector Injector that can be used by the trigger to resolve DI tokens.
 */
export function onHover(
    trigger: Element, callback: VoidFunction, injector: Injector): VoidFunction {
  let entry = hoverTriggers.get(trigger);

  // If this is the first entry for this element, add the listener.
  if (!entry) {
    entry = new DeferEventEntry();
    hoverTriggers.set(trigger, entry);
    // Ensure that the handler runs in the NgZone since it gets
    // registered in `afterRender` which runs outside.
    injector.get(NgZone).run(() => {
      for (const name of hoverEventNames) {
        trigger.addEventListener(name, entry!.listener, eventListenerOptions);
      }
    });
  }

  entry.callbacks.add(callback);

  return () => {
    const {callbacks, listener} = entry!;
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      for (const name of hoverEventNames) {
        trigger.removeEventListener(name, listener, eventListenerOptions);
      }
      hoverTriggers.delete(trigger);
    }
  };
}

/**
 * Registers a viewport trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger comes into the viewport.
 * @param injector Injector that can be used by the trigger to resolve DI tokens.
 */
export function onViewport(
    trigger: Element, callback: VoidFunction, injector: Injector): VoidFunction {
  return injector.get(DeferIntersectionManager).register(trigger, callback);
}

/** Keeps track of the registered `viewport` triggers. */
class DeferIntersectionManager {
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: DeferIntersectionManager,
    providedIn: 'root',
    factory: () => new DeferIntersectionManager(inject(NgZone)),
  });

  /** `IntersectionObserver` used to observe `viewport` triggers. */
  private intersectionObserver: IntersectionObserver|null = null;

  /** Number of elements currently observed with `viewport` triggers. */
  private observedViewportElements = 0;

  /** Currently-registered `viewport` triggers. */
  private viewportTriggers = new WeakMap<Element, DeferEventEntry>();

  constructor(private ngZone: NgZone) {}

  register(trigger: Element, callback: VoidFunction): VoidFunction {
    let entry = this.viewportTriggers.get(trigger);

    if (!this.intersectionObserver) {
      this.intersectionObserver =
          this.ngZone.runOutsideAngular(() => new IntersectionObserver(this.intersectionCallback));
    }

    if (!entry) {
      entry = new DeferEventEntry();
      this.ngZone.runOutsideAngular(() => this.intersectionObserver!.observe(trigger));
      this.viewportTriggers.set(trigger, entry);
      this.observedViewportElements++;
    }

    entry.callbacks.add(callback);

    return () => {
      entry!.callbacks.delete(callback);

      if (entry!.callbacks.size === 0) {
        this.intersectionObserver?.unobserve(trigger);
        this.viewportTriggers.delete(trigger);
        this.observedViewportElements--;
      }

      if (this.observedViewportElements === 0) {
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;
      }
    };
  }

  private intersectionCallback: IntersectionObserverCallback = entries => {
    for (const current of entries) {
      // Only invoke the callbacks if the specific element is intersecting.
      if (current.isIntersecting && this.viewportTriggers.has(current.target)) {
        this.ngZone.run(this.viewportTriggers.get(current.target)!.listener);
      }
    }
  }
}
