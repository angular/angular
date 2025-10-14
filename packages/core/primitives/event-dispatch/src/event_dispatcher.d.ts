/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventInfo } from './event_info';
import { UnrenamedEventContract } from './eventcontract';
import '../../../src/util/ng_dev_mode';
/**
 * A replayer is a function that is called when there are queued events, from the `EventContract`.
 */
export type Replayer = (eventInfoWrappers: Event[]) => void;
/** An internal symbol used to indicate whether propagation should be stopped or not. */
export declare const PROPAGATION_STOPPED_SYMBOL: unique symbol;
/** Extra event phases beyond what the browser provides. */
export declare const EventPhase: {
    REPLAY: number;
};
declare global {
    interface Event {
        [PROPAGATION_STOPPED_SYMBOL]?: boolean;
    }
}
/**
 * A dispatcher that uses browser-based `Event` semantics, for example bubbling, `stopPropagation`,
 * `currentTarget`, etc.
 */
export declare class EventDispatcher {
    private readonly dispatchDelegate;
    private readonly clickModSupport;
    private readonly actionResolver;
    private readonly dispatcher;
    constructor(dispatchDelegate: (event: Event, actionName: string) => void, clickModSupport?: boolean);
    /**
     * The entrypoint for the `EventContract` dispatch.
     */
    dispatch(eventInfo: EventInfo): void;
    /** Internal method that does basic disaptching. */
    private dispatchToDelegate;
}
/**
 * Registers deferred functionality for an EventContract and a Jsaction
 * Dispatcher.
 */
export declare function registerDispatcher(eventContract: UnrenamedEventContract, dispatcher: EventDispatcher): void;
