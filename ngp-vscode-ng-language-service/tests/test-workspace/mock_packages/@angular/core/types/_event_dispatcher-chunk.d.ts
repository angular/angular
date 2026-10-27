/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

declare global {
    /**
     * Values of ngDevMode
     * Depending on the current state of the application, ngDevMode may have one of several values.
     *
     * For convenience, the “truthy” value which enables dev mode is also an object which contains
     * Angular’s performance counters. This is not necessary, but cuts down on boilerplate for the
     * perf counters.
     *
     * ngDevMode may also be set to false. This can happen in one of a few ways:
     * - The user explicitly sets `window.ngDevMode = false` somewhere in their app.
     * - The user calls `enableProdMode()`.
     * - The URL contains a `ngDevMode=false` text.
     * Finally, ngDevMode may not have been defined at all.
     */
    const ngDevMode: null | NgDevModePerfCounters;
    interface NgDevModePerfCounters {
        hydratedNodes: number;
        hydratedComponents: number;
        dehydratedViewsRemoved: number;
        dehydratedViewsCleanupRuns: number;
        componentsSkippedHydration: number;
        deferBlocksWithIncrementalHydration: number;
    }
}

/**
 * Records information about the action that should handle a given `Event`.
 */
interface ActionInfo {
    name: string;
    element: Element;
}
type ActionInfoInternal = [name: string, element: Element];
/**
 * Records information for later handling of events. This type is
 * shared, and instances of it are passed, between the eventcontract
 * and the dispatcher jsbinary. Therefore, the fields of this type are
 * referenced by string literals rather than property literals
 * throughout the code.
 *
 * 'targetElement' is the element the action occurred on, 'actionElement'
 * is the element that has the jsaction handler.
 *
 * A null 'actionElement' identifies an EventInfo instance that didn't match a
 * jsaction attribute.  This allows us to execute global event handlers with the
 * appropriate event type (including a11y clicks and custom events).
 * The declare portion of this interface creates a set of externs that make sure
 * renaming doesn't happen for EventInfo. This is important since EventInfo
 * is shared across multiple binaries.
 */
declare interface EventInfo {
    eventType: string;
    event: Event;
    targetElement: Element;
    /** The element that is the container for this Event. */
    eic: Element;
    timeStamp: number;
    /**
     * The action parsed from the JSAction element.
     */
    eia?: ActionInfoInternal;
    /**
     * Whether this `Event` is a replay event, meaning no dispatcher was
     * installed when this `Event` was originally dispatched.
     */
    eirp?: boolean;
    /**
     * Whether this `Event` represents a `keydown` event that should be processed
     * as a `click`. Only used when a11y click events is on.
     */
    eiack?: boolean;
    /** Whether action resolution has already run on this `EventInfo`. */
    eir?: boolean;
}
/**
 * Utility class around an `EventInfo`.
 *
 * This should be used in compilation units that are less sensitive to code
 * size.
 */
declare class EventInfoWrapper {
    readonly eventInfo: EventInfo;
    constructor(eventInfo: EventInfo);
    getEventType(): string;
    setEventType(eventType: string): void;
    getEvent(): Event;
    setEvent(event: Event): void;
    getTargetElement(): Element;
    setTargetElement(targetElement: Element): void;
    getContainer(): Element;
    setContainer(container: Element): void;
    getTimestamp(): number;
    setTimestamp(timestamp: number): void;
    getAction(): {
        name: string;
        element: Element;
    } | undefined;
    setAction(action: ActionInfo | undefined): void;
    getIsReplay(): boolean | undefined;
    setIsReplay(replay: boolean): void;
    getResolved(): boolean | undefined;
    setResolved(resolved: boolean): void;
    clone(): EventInfoWrapper;
}

declare interface EarlyJsactionDataContainer {
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
declare interface EarlyJsactionData {
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
 * An `EventContractContainerManager` provides the common interface for managing
 * containers.
 */
interface EventContractContainerManager {
    addEventListener(eventType: string, getHandler: (element: Element) => (event: Event) => void, passive?: boolean): void;
    cleanUp(): void;
}
/**
 * A class representing a container node and all the event handlers
 * installed on it. Used so that handlers can be cleaned up if the
 * container is removed from the contract.
 */
declare class EventContractContainer implements EventContractContainerManager {
    readonly element: Element;
    /**
     * Array of event handlers and their corresponding event types that are
     * installed on this container.
     *
     */
    private handlerInfos;
    /**
     * @param element The container Element.
     */
    constructor(element: Element);
    /**
     * Installs the provided installer on the element owned by this container,
     * and maintains a reference to resulting handler in order to remove it
     * later if desired.
     */
    addEventListener(eventType: string, getHandler: (element: Element) => (event: Event) => void, passive?: boolean): void;
    /**
     * Removes all the handlers installed on this container.
     */
    cleanUp(): void;
}

/**
 * @fileoverview An enum to control who can call certain jsaction APIs.
 */
declare enum Restriction {
    I_AM_THE_JSACTION_FRAMEWORK = 0
}

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

/**
 * The API of an EventContract that is safe to call from any compilation unit.
 */
declare interface UnrenamedEventContract {
    ecrd(dispatcher: Dispatcher, restriction: Restriction): void;
}
/** A function that is called to handle events captured by the EventContract. */
type Dispatcher = (eventInfo: EventInfo, globalDispatch?: boolean) => void;
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
declare class EventContract implements UnrenamedEventContract {
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
    replayEarlyEventInfos(earlyEventInfos: EventInfo[]): void;
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

/** An internal symbol used to indicate whether propagation should be stopped or not. */
declare const PROPAGATION_STOPPED_SYMBOL: unique symbol;
/** Extra event phases beyond what the browser provides. */
declare const EventPhase: {
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
declare class EventDispatcher {
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
declare function registerDispatcher(eventContract: UnrenamedEventContract, dispatcher: EventDispatcher): void;

export { EventContract, EventContractContainer, EventDispatcher, EventInfoWrapper, EventPhase, registerDispatcher };
export type { EarlyJsactionDataContainer, EventInfo };
