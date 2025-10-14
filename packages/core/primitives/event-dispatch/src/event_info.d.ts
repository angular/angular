/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Records information about the action that should handle a given `Event`.
 */
export interface ActionInfo {
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
export declare interface EventInfo {
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
/** Added for readability when accessing stable property names. */
export declare function getEventType(eventInfo: EventInfo): string;
/** Added for readability when accessing stable property names. */
export declare function setEventType(eventInfo: EventInfo, eventType: string): void;
/** Added for readability when accessing stable property names. */
export declare function getEvent(eventInfo: EventInfo): Event;
/** Added for readability when accessing stable property names. */
export declare function setEvent(eventInfo: EventInfo, event: Event): void;
/** Added for readability when accessing stable property names. */
export declare function getTargetElement(eventInfo: EventInfo): Element;
/** Added for readability when accessing stable property names. */
export declare function setTargetElement(eventInfo: EventInfo, targetElement: Element): void;
/** Added for readability when accessing stable property names. */
export declare function getContainer(eventInfo: EventInfo): Element;
/** Added for readability when accessing stable property names. */
export declare function setContainer(eventInfo: EventInfo, container: Element): void;
/** Added for readability when accessing stable property names. */
export declare function getTimestamp(eventInfo: EventInfo): number;
/** Added for readability when accessing stable property names. */
export declare function setTimestamp(eventInfo: EventInfo, timestamp: number): void;
/** Added for readability when accessing stable property names. */
export declare function getAction(eventInfo: EventInfo): ActionInfoInternal | undefined;
/** Added for readability when accessing stable property names. */
export declare function setAction(eventInfo: EventInfo, actionName: string, actionElement: Element): void;
/** Added for readability when accessing stable property names. */
export declare function unsetAction(eventInfo: EventInfo): void;
/** Added for readability when accessing stable property names. */
export declare function getActionName(actionInfo: ActionInfoInternal): string;
/** Added for readability when accessing stable property names. */
export declare function getActionElement(actionInfo: ActionInfoInternal): Element;
/** Added for readability when accessing stable property names. */
export declare function getIsReplay(eventInfo: EventInfo): boolean | undefined;
/** Added for readability when accessing stable property names. */
export declare function setIsReplay(eventInfo: EventInfo, replay: boolean): void;
/** Added for readability when accessing stable property names. */
export declare function getA11yClickKey(eventInfo: EventInfo): boolean | undefined;
/** Added for readability when accessing stable property names. */
export declare function setA11yClickKey(eventInfo: EventInfo, a11yClickKey: boolean): void;
/** Added for readability when accessing stable property names. */
export declare function getResolved(eventInfo: EventInfo): boolean | undefined;
/** Added for readability when accessing stable property names. */
export declare function setResolved(eventInfo: EventInfo, resolved: boolean): void;
/** Clones an `EventInfo` */
export declare function cloneEventInfo(eventInfo: EventInfo): EventInfo;
/**
 * Utility function for creating an `EventInfo`.
 *
 * This can be used from code-size sensitive compilation units, as taking
 * parameters vs. an `Object` literal reduces code size.
 */
export declare function createEventInfoFromParameters(eventType: string, event: Event, targetElement: Element, container: Element, timestamp: number, action?: ActionInfoInternal, isReplay?: boolean, a11yClickKey?: boolean): EventInfo;
/**
 * Utility function for creating an `EventInfo`.
 *
 * This should be used in compilation units that are less sensitive to code
 * size.
 */
export declare function createEventInfo({ eventType, event, targetElement, container, timestamp, action, isReplay, a11yClickKey, }: {
    eventType: string;
    event: Event;
    targetElement: Element;
    container: Element;
    timestamp: number;
    action?: ActionInfo;
    isReplay?: boolean;
    a11yClickKey?: boolean;
}): EventInfo;
/**
 * Utility class around an `EventInfo`.
 *
 * This should be used in compilation units that are less sensitive to code
 * size.
 */
export declare class EventInfoWrapper {
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
export {};
