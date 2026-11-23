/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import { EarlyJsactionDataContainer, EventInfo } from './_event_dispatcher-chunk.js';
export { EventContract, EventContractContainer, EventDispatcher, EventInfoWrapper, EventPhase, registerDispatcher } from './_event_dispatcher-chunk.js';

declare const Attribute: {
    /**
     * The jsaction attribute defines a mapping of a DOM event to a
     * generic event (aka jsaction), to which the actual event handlers
     * that implement the behavior of the application are bound. The
     * value is a semicolon separated list of colon separated pairs of
     * an optional DOM event name and a jsaction name. If the optional
     * DOM event name is omitted, 'click' is assumed. The jsaction names
     * are dot separated pairs of a namespace and a simple jsaction
     * name.
     *
     * See grammar in README.md for expected syntax in the attribute value.
     */
    JSACTION: "jsaction";
};

/**
 * Reads the jsaction parser cache for the given DOM element. If no cache is yet present,
 * creates an empty one.
 */
declare function getDefaulted(element: Element): {
    [key: string]: string | undefined;
};

/**
 * Whether or not an event type should be registered in the capture phase.
 * @param eventType
 * @returns bool
 */
declare const isCaptureEventType: (eventType: string) => boolean;
/**
 * Whether or not an event type is registered in the early contract.
 */
declare const isEarlyEventType: (eventType: string) => boolean;

/**
 * Creates an `EarlyJsactionData`, adds events to it, and populates it on a nested object on
 * the window.
 */
declare function bootstrapAppScopedEarlyEventContract(container: HTMLElement, appId: string, bubbleEventTypes: string[], captureEventTypes: string[], dataContainer?: EarlyJsactionDataContainer): void;
/** Get the queued `EventInfo` objects that were dispatched before a dispatcher was registered. */
declare function getAppScopedQueuedEventInfos(appId: string, dataContainer?: EarlyJsactionDataContainer): EventInfo[];
/**
 * Registers a dispatcher function on the `EarlyJsactionData` present on the nested object on the
 * window.
 */
declare function registerAppScopedDispatcher(appId: string, dispatcher: (eventInfo: EventInfo) => void, dataContainer?: EarlyJsactionDataContainer): void;
/** Removes all event listener handlers. */
declare function removeAllAppScopedEventListeners(appId: string, dataContainer?: EarlyJsactionDataContainer): void;
/** Clear the early event contract. */
declare function clearAppScopedEarlyEventContract(appId: string, dataContainer?: EarlyJsactionDataContainer): void;

export { Attribute, EarlyJsactionDataContainer, bootstrapAppScopedEarlyEventContract, clearAppScopedEarlyEventContract, getDefaulted as getActionCache, getAppScopedQueuedEventInfos, isCaptureEventType, isEarlyEventType, registerAppScopedDispatcher, removeAllAppScopedEventListeners };
