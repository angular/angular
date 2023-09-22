/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Configuration object used to register passive and capturing events. */
const eventListenerOptions: AddEventListenerOptions = {
  passive: true,
  capture: true
};

/** Keeps track of the currently-registered `on interaction` triggers. */
const interactionTriggers = new WeakMap<Element, DeferEventEntry>();

/** Names of the events considered as interaction events. */
const interactionEventNames = ['click', 'keydown'] as const;

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
 */
export function onInteraction(trigger: Element, callback: VoidFunction) {
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

    for (const name of interactionEventNames) {
      trigger.addEventListener(name, entry.listener, eventListenerOptions);
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
