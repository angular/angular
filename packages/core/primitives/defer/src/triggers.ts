
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
const viewportTriggers = new WeakMap<Element, DeferEventEntry>();

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

export function getViewportTriggers() {
  return viewportTriggers;
}

/**
 * Registers an interaction trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is interacted with.
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

export interface Observer {
  observe: (target: Element) => void,
  unobserve: (target: Element) => void,
  disconnect: () => void;
}

/**
 * Registers a viewport trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger comes into the viewport.
 * @param observer Observer interface which provides a way to observe changes to target element
 */
export function onViewport(
  trigger: Element,
  callback: VoidFunction,
  observer: Observer, 
): VoidFunction {
  let entry = viewportTriggers.get(trigger);

  if (!entry) {
    entry = new DeferEventEntry();
    observer.observe(trigger);
    viewportTriggers.set(trigger, entry);
    observedViewportElements++;
  }

  entry.callbacks.add(callback);

  return () => {
    // It's possible that a different cleanup callback fully removed this element already.
    if (!viewportTriggers.has(trigger)) {
      return;
    }

    entry!.callbacks.delete(callback);

    if (entry!.callbacks.size === 0) {
      observer.unobserve(trigger);
      viewportTriggers.delete(trigger);
      observedViewportElements--;
    }

    if (observedViewportElements === 0) {
      observer.disconnect();
    }
  };
}


// function createIntersectionObserver(ngZone: NgZone | undefined): IntersectionObserver {
//   return new IntersectionObserver((entries) => {
//     for (const current of entries) {
//       // Only invoke the callbacks if the specific element is intersecting.
//       if (current.isIntersecting && viewportTriggers.has(current.target)) {
//         if (ngZone) {
//           ngZone!.run(viewportTriggers.get(current.target)!.listener);
//         } else {
//           viewportTriggers.get(current.target)!.listener();
//         }
//       }
//     }
//   })
// }

// /**
//  * Registers a viewport trigger.
//  * @param trigger Element that is the trigger.
//  * @param callback Callback to be invoked when the trigger comes into the viewport.
//  * @param injector Injector that can be used by the trigger to resolve DI tokens.
//  */
// export function onViewport(
//   trigger: Element,
//   callback: VoidFunction,
//   injector?: Injector,
// ): VoidFunction {
//   const ngZone = injector?.get(NgZone);
//   let entry = viewportTriggers.get(trigger);

//   if (!intersectionObserver) {
//     if (injector) {
//       intersectionObserver = ngZone!.runOutsideAngular(() => {
//         return createIntersectionObserver(ngZone);
//       });
//     } else {
//       intersectionObserver = createIntersectionObserver(ngZone);
//     }
//   }

//   if (!entry) {
//     entry = new DeferEventEntry();
//     if (ngZone) {
//       ngZone.runOutsideAngular(() => intersectionObserver!.observe(trigger));
//     } else {
//       intersectionObserver!.observe(trigger);
//     }
//     viewportTriggers.set(trigger, entry);
//     observedViewportElements++;
//   }

//   entry.callbacks.add(callback);

//   return () => {
//     // It's possible that a different cleanup callback fully removed this element already.
//     if (!viewportTriggers.has(trigger)) {
//       return;
//     }

//     entry!.callbacks.delete(callback);

//     if (entry!.callbacks.size === 0) {
//       intersectionObserver?.unobserve(trigger);
//       viewportTriggers.delete(trigger);
//       observedViewportElements--;
//     }

//     if (observedViewportElements === 0) {
//       intersectionObserver?.disconnect();
//       intersectionObserver = null;
//     }
//   };
// }

