/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Restriction } from './restriction';
import { EarlyJsactionDataContainer } from './earlyeventcontract';
import { EventInfo } from './event_info';
/**
 * Creates an `EarlyJsactionData`, adds events to it, and populates it on a nested object on
 * the window.
 */
export declare function bootstrapAppScopedEarlyEventContract(container: HTMLElement, appId: string, bubbleEventTypes: string[], captureEventTypes: string[], dataContainer?: EarlyJsactionDataContainer): void;
/** Get the queued `EventInfo` objects that were dispatched before a dispatcher was registered. */
export declare function getAppScopedQueuedEventInfos(appId: string, dataContainer?: EarlyJsactionDataContainer): EventInfo[];
/**
 * Registers a dispatcher function on the `EarlyJsactionData` present on the nested object on the
 * window.
 */
export declare function registerAppScopedDispatcher(restriction: Restriction, appId: string, dispatcher: (eventInfo: EventInfo) => void, dataContainer?: EarlyJsactionDataContainer): void;
/** Removes all event listener handlers. */
export declare function removeAllAppScopedEventListeners(appId: string, dataContainer?: EarlyJsactionDataContainer): void;
/** Clear the early event contract. */
export declare function clearAppScopedEarlyEventContract(appId: string, dataContainer?: EarlyJsactionDataContainer): void;
