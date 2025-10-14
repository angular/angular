/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventInfo } from './event_info';
export declare interface EarlyJsactionDataContainer {
    _ejsa?: EarlyJsactionData;
    _ejsas?: {
        [appId: string]: EarlyJsactionData | undefined;
    };
}
declare global {
    interface Window {
        _ejsa?: EarlyJsactionData;
        _ejsas?: {
            [appId: string]: EarlyJsactionData | undefined;
        };
    }
}
/**
 * Defines the early jsaction data types.
 */
export declare interface EarlyJsactionData {
    /** List used to keep track of the early JSAction event types. */
    et: string[];
    /** List used to keep track of the early JSAction capture event types. */
    etc: string[];
    /** Early JSAction handler for all events. */
    h: (event: Event) => void;
    /** Dispatcher handler. Initializes to populating `q`. */
    d: (eventInfo: EventInfo) => void;
    /** List used to push `EventInfo` objects if the dispatcher is not registered. */
    q: EventInfo[];
    /** Container for listening to events. */
    c: HTMLElement;
}
/**
 * EarlyEventContract intercepts events in the bubbling phase at the
 * boundary of the document body. This mapping will be passed to the
 * late-loaded EventContract.
 */
export declare class EarlyEventContract {
    private readonly dataContainer;
    constructor(dataContainer?: EarlyJsactionDataContainer, container?: HTMLElement);
    /**
     * Installs a list of event types for container .
     */
    addEvents(types: string[], capture?: boolean): void;
}
/** Creates an `EarlyJsactionData` object. */
export declare function createEarlyJsactionData(container: HTMLElement): {
    c: HTMLElement;
    q: EventInfo[];
    et: never[];
    etc: never[];
    d: (eventInfo: EventInfo) => void;
    h: (event: Event) => void;
};
/** Add all the events to the container stored in the `EarlyJsactionData`. */
export declare function addEvents(earlyJsactionData: EarlyJsactionData, types: string[], capture?: boolean): void;
/** Get the queued `EventInfo` objects that were dispatched before a dispatcher was registered. */
export declare function getQueuedEventInfos(earlyJsactionData: EarlyJsactionData | undefined): EventInfo[];
/** Register a different dispatcher function on the `EarlyJsactionData`. */
export declare function registerDispatcher(earlyJsactionData: EarlyJsactionData | undefined, dispatcher: (eventInfo: EventInfo) => void): void;
/** Removes all event listener handlers. */
export declare function removeAllEventListeners(earlyJsactionData: EarlyJsactionData | undefined): void;
