/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Configuration object used to register passive and capturing events. */
const eventListenerOptions: AddEventListenerOptions = {
  passive: true,
  capture: true,
};

/** Keeps track of the currently-registered `on hover` triggers. */
const hoverTriggers = new WeakMap<Element, DeferEventEntry>();

/** Keeps track of the currently-registered `on interaction` triggers. */
const interactionTriggers = new WeakMap<Element, DeferEventEntry>();

/** Currently-registered `viewport` triggers. */
export const viewportTriggers = new WeakMap<Element, DeferEventEntry>();

/** Names of the events considered as interaction events. */
export const interactionEventNames = ['click', 'keydown'] as const;

/** Names of the events considered as hover events. */
export const hoverEventNames = ['mouseenter', 'mouseover', 'focusin'] as const;

/** `IntersectionObserver` used to observe `viewport` triggers. */
let intersectionObserver: IntersectionObserver | null = null;

/** Number of elements currently observed with `viewport` triggers. */
let observedViewportElements = 0;

/** Object keeping track of registered callbacks for a deferred block trigger. */
class DeferEventEntry {
  callbacks = new Set<VoidFunction>();

  listener = () => {
    for (const callback of this.callbacks) {
      callback();
    }
  };
}

/**
 * Registers an interaction trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is interacted with.
 * @return cleanup function which removes trigger Element from interactionTriggers map
 * and interaction event listeners from the trigger Element
 */
export function onInteraction(trigger: Element, callback: VoidFunction): VoidFunction {
  let entry = interactionTriggers.get(trigger);

  // If this is the first entry for this element, add the listeners.
  if (!entry) {
    // Note that managing events centrally like this lends itself well to using global
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

    for (const name of interactionEventNames) {
      trigger.addEventListener(name, entry!.listener, eventListenerOptions);
    }
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
 * @return cleanup function which removes trigger element from hoverTriggers map
 * and removes hover interaction event listeners from the trigger element
 */
export function onHover(trigger: Element, callback: VoidFunction): VoidFunction {
  let entry = hoverTriggers.get(trigger);

  // If this is the first entry for this element, add the listener.
  if (!entry) {
    entry = new DeferEventEntry();
    hoverTriggers.set(trigger, entry);

    for (const name of hoverEventNames) {
      trigger.addEventListener(name, entry!.listener, eventListenerOptions);
    }
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
 * Used to create an IntersectionObserver instance.
 * @return IntersectionObserver that is used by onViewport
 */
export function createIntersectionObserver() {
  return new IntersectionObserver((entries) => {
    for (const current of entries) {
      if (current.isIntersecting && viewportTriggers.has(current.target)) {
        viewportTriggers.get(current.target)!.listener();
      }
    }
  });
}

/**
 * Registers a viewport trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger comes into the viewport.
 * @param observerFactoryFn Factory function which returns an IntersectionObserver
 * @return cleanup function which removes trigger Element from viewportTriggers map
 * and tells the intersection observer to stop observing trigger Element and set
 * intersectionObserver to null if there are no more Elements to observe
 */
export function onViewport(
  trigger: Element,
  callback: VoidFunction,
  observerFactoryFn: () => IntersectionObserver,
): VoidFunction {
  let entry = viewportTriggers.get(trigger);

  intersectionObserver = intersectionObserver || observerFactoryFn();

  if (!entry) {
    entry = new DeferEventEntry();
    intersectionObserver!.observe(trigger);
    viewportTriggers.set(trigger, entry);
    observedViewportElements++;
  }

  entry.callbacks.add(callback);

  return () => {
    if (!viewportTriggers.has(trigger)) {
      return;
    }

    entry!.callbacks.delete(callback);

    if (entry!.callbacks.size === 0) {
      intersectionObserver?.unobserve(trigger);
      viewportTriggers.delete(trigger);
      observedViewportElements--;
    }

    if (observedViewportElements === 0) {
      intersectionObserver?.disconnect();
      intersectionObserver = null;
    }
  };
}
