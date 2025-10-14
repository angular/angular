/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @fileoverview Implements the local event handling contract. This
 * allows DOM objects in a container that enters into this contract to
 * define event handlers which are executed in a local context.
 *
 * One EventContract instance can manage the contract for multiple
 * containers, which are added using the addContainer() method.
 *
 * Events can be registered using the addEvent() method.
 *
 * A Dispatcher is added using the registerDispatcher() method. Until there is
 * a dispatcher, events are queued. The idea is that the EventContract
 * class is inlined in the HTML of the top level page and instantiated
 * right after the start of <body>. The Dispatcher class is contained
 * in the external deferred js, and instantiated and registered with
 * EventContract when the external javascript in the page loads. The
 * external javascript will also register the jsaction handlers, which
 * then pick up the queued events at the time of registration.
 *
 * Since this class is meant to be inlined in the main page HTML, the
 * size of the binary compiled from this file MUST be kept as small as
 * possible and thus its dependencies to a minimum.
 */
import { EarlyJsactionData } from './earlyeventcontract';
import { EventContractContainerManager } from './event_contract_container';
import * as eventInfoLib from './event_info';
import { Restriction } from './restriction';
/**
 * The API of an EventContract that is safe to call from any compilation unit.
 */
export declare interface UnrenamedEventContract {
    ecrd(dispatcher: Dispatcher, restriction: Restriction): void;
}
/** A function that is called to handle events captured by the EventContract. */
export type Dispatcher = (eventInfo: eventInfoLib.EventInfo, globalDispatch?: boolean) => void;
/**
 * A function that handles an event dispatched from the browser.
 *
 * eventType: May differ from `event.type` if JSAction uses a
 * short-hand name or is patching over an non-bubbling event with a bubbling
 * variant.
 * event: The native browser event.
 * container: The container for this dispatch.
 */
type EventHandler = (eventType: string, event: Event, container: Element) => void;
/**
 * EventContract intercepts events in the bubbling phase at the
 * boundary of a container element, and maps them to generic actions
 * which are specified using the custom jsaction attribute in
 * HTML. Behavior of the application is then specified in terms of
 * handler for such actions, cf. jsaction.Dispatcher in dispatcher.js.
 *
 * This has several benefits: (1) No DOM event handlers need to be
 * registered on the specific elements in the UI. (2) The set of
 * events that the application has to handle can be specified in terms
 * of the semantics of the application, rather than in terms of DOM
 * events. (3) Invocation of handlers can be delayed and handlers can
 * be delay loaded in a generic way.
 */
export declare class EventContract implements UnrenamedEventContract {
    static MOUSE_SPECIAL_SUPPORT: boolean;
    private containerManager;
    /**
     * The DOM events which this contract covers. Used to prevent double
     * registration of event types. The value of the map is the
     * internally created DOM event handler function that handles the
     * DOM events. See addEvent().
     *
     */
    private eventHandlers;
    private browserEventTypeToExtraEventTypes;
    /**
     * The dispatcher function. Events are passed to this function for
     * handling once it was set using the registerDispatcher() method. This is
     * done because the function is passed from another jsbinary, so passing the
     * instance and invoking the method here would require to leave the method
     * unobfuscated.
     */
    private dispatcher;
    /**
     * The list of suspended `EventInfo` that will be dispatched
     * as soon as the `Dispatcher` is registered.
     */
    private queuedEventInfos;
    constructor(containerManager: EventContractContainerManager);
    private handleEvent;
    /**
     * Handle an `EventInfo`.
     */
    private handleEventInfo;
    /**
     * Enables jsaction handlers to be called for the event type given by
     * name.
     *
     * If the event is already registered, this does nothing.
     *
     * @param prefixedEventType If supplied, this event is used in
     *     the actual browser event registration instead of the name that is
     *     exposed to jsaction. Use this if you e.g. want users to be able
     *     to subscribe to jsaction="transitionEnd:foo" while the underlying
     *     event is webkitTransitionEnd in one browser and mozTransitionEnd
     *     in another.
     *
     * @param passive A boolean value that, if `true`, indicates that the event
     *     handler will never call `preventDefault()`.
     */
    addEvent(eventType: string, prefixedEventType?: string, passive?: boolean): void;
    /**
     * Gets the queued early events and replay them using the appropriate handler
     * in the provided event contract. Once all the events are replayed, it cleans
     * up the early contract.
     */
    replayEarlyEvents(earlyJsactionData?: EarlyJsactionData | undefined): void;
    /**
     * Replays all the early `EventInfo` objects, dispatching them through the normal
     * `EventContract` flow.
     */
    replayEarlyEventInfos(earlyEventInfos: eventInfoLib.EventInfo[]): void;
    /**
     * Returns all JSAction event types that have been registered for a given
     * browser event type.
     */
    private getEventTypesForBrowserEventType;
    /**
     * Returns the event handler function for a given event type.
     */
    handler(eventType: string): EventHandler | undefined;
    /**
     * Cleans up the event contract. This resets all of the `EventContract`'s
     * internal state. Users are responsible for not using this `EventContract`
     * after it has been cleaned up.
     */
    cleanUp(): void;
    /**
     * Register a dispatcher function. Event info of each event mapped to
     * a jsaction is passed for handling to this callback. The queued
     * events are passed as well to the dispatcher for later replaying
     * once the dispatcher is registered. Clears the event queue to null.
     *
     * @param dispatcher The dispatcher function.
     * @param restriction
     */
    registerDispatcher(dispatcher: Dispatcher, restriction: Restriction): void;
    /**
     * Unrenamed alias for registerDispatcher. Necessary for any codebases that
     * split the `EventContract` and `Dispatcher` code into different compilation
     * units.
     */
    ecrd(dispatcher: Dispatcher, restriction: Restriction): void;
}
export {};
