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
export function getEventType(eventInfo: EventInfo) {
  return eventInfo.eventType;
}

/** Added for readability when accessing stable property names. */
export function setEventType(eventInfo: EventInfo, eventType: string) {
  eventInfo.eventType = eventType;
}

/** Added for readability when accessing stable property names. */
export function getEvent(eventInfo: EventInfo) {
  return eventInfo.event;
}

/** Added for readability when accessing stable property names. */
export function setEvent(eventInfo: EventInfo, event: Event) {
  eventInfo.event = event;
}

/** Added for readability when accessing stable property names. */
export function getTargetElement(eventInfo: EventInfo) {
  return eventInfo.targetElement;
}

/** Added for readability when accessing stable property names. */
export function setTargetElement(eventInfo: EventInfo, targetElement: Element) {
  eventInfo.targetElement = targetElement;
}

/** Added for readability when accessing stable property names. */
export function getContainer(eventInfo: EventInfo) {
  return eventInfo.eic;
}

/** Added for readability when accessing stable property names. */
export function setContainer(eventInfo: EventInfo, container: Element) {
  eventInfo.eic = container;
}

/** Added for readability when accessing stable property names. */
export function getTimestamp(eventInfo: EventInfo) {
  return eventInfo.timeStamp;
}

/** Added for readability when accessing stable property names. */
export function setTimestamp(eventInfo: EventInfo, timestamp: number) {
  eventInfo.timeStamp = timestamp;
}

/** Added for readability when accessing stable property names. */
export function getAction(eventInfo: EventInfo) {
  return eventInfo.eia;
}

/** Added for readability when accessing stable property names. */
export function setAction(eventInfo: EventInfo, actionName: string, actionElement: Element) {
  eventInfo.eia = [actionName, actionElement];
}

/** Added for readability when accessing stable property names. */
export function unsetAction(eventInfo: EventInfo) {
  eventInfo.eia = undefined;
}

/** Added for readability when accessing stable property names. */
export function getActionName(actionInfo: ActionInfoInternal) {
  return actionInfo[0];
}

/** Added for readability when accessing stable property names. */
export function getActionElement(actionInfo: ActionInfoInternal) {
  return actionInfo[1];
}

/** Added for readability when accessing stable property names. */
export function getIsReplay(eventInfo: EventInfo) {
  return eventInfo.eirp;
}

/** Added for readability when accessing stable property names. */
export function setIsReplay(eventInfo: EventInfo, replay: boolean) {
  eventInfo.eirp = replay;
}

/** Added for readability when accessing stable property names. */
export function getA11yClickKey(eventInfo: EventInfo) {
  return eventInfo.eiack;
}

/** Added for readability when accessing stable property names. */
export function setA11yClickKey(eventInfo: EventInfo, a11yClickKey: boolean) {
  eventInfo.eiack = a11yClickKey;
}

/** Added for readability when accessing stable property names. */
export function getResolved(eventInfo: EventInfo) {
  return eventInfo.eir;
}

/** Added for readability when accessing stable property names. */
export function setResolved(eventInfo: EventInfo, resolved: boolean) {
  eventInfo.eir = resolved;
}

/** Clones an `EventInfo` */
export function cloneEventInfo(eventInfo: EventInfo): EventInfo {
  return {
    eventType: eventInfo.eventType,
    event: eventInfo.event,
    targetElement: eventInfo.targetElement,
    eic: eventInfo.eic,
    eia: eventInfo.eia,
    timeStamp: eventInfo.timeStamp,
    eirp: eventInfo.eirp,
    eiack: eventInfo.eiack,
    eir: eventInfo.eir,
  };
}

/**
 * Utility function for creating an `EventInfo`.
 *
 * This can be used from code-size sensitive compilation units, as taking
 * parameters vs. an `Object` literal reduces code size.
 */
export function createEventInfoFromParameters(
  eventType: string,
  event: Event,
  targetElement: Element,
  container: Element,
  timestamp: number,
  action?: ActionInfoInternal,
  isReplay?: boolean,
  a11yClickKey?: boolean,
): EventInfo {
  return {
    eventType,
    event,
    targetElement,
    eic: container,
    timeStamp: timestamp,
    eia: action,
    eirp: isReplay,
    eiack: a11yClickKey,
  };
}

/**
 * Utility function for creating an `EventInfo`.
 *
 * This should be used in compilation units that are less sensitive to code
 * size.
 */
export function createEventInfo({
  eventType,
  event,
  targetElement,
  container,
  timestamp,
  action,
  isReplay,
  a11yClickKey,
}: {
  eventType: string;
  event: Event;
  targetElement: Element;
  container: Element;
  timestamp: number;
  action?: ActionInfo;
  isReplay?: boolean;
  a11yClickKey?: boolean;
}): EventInfo {
  return {
    eventType,
    event,
    targetElement,
    eic: container,
    timeStamp: timestamp,
    eia: action ? [action.name, action.element] : undefined,
    eirp: isReplay,
    eiack: a11yClickKey,
  };
}

/**
 * Utility class around an `EventInfo`.
 *
 * This should be used in compilation units that are less sensitive to code
 * size.
 */
export class EventInfoWrapper {
  constructor(readonly eventInfo: EventInfo) {}

  getEventType() {
    return getEventType(this.eventInfo);
  }

  setEventType(eventType: string) {
    setEventType(this.eventInfo, eventType);
  }

  getEvent() {
    return getEvent(this.eventInfo);
  }

  setEvent(event: Event) {
    setEvent(this.eventInfo, event);
  }

  getTargetElement() {
    return getTargetElement(this.eventInfo);
  }

  setTargetElement(targetElement: Element) {
    setTargetElement(this.eventInfo, targetElement);
  }

  getContainer() {
    return getContainer(this.eventInfo);
  }

  setContainer(container: Element) {
    setContainer(this.eventInfo, container);
  }
  getTimestamp() {
    return getTimestamp(this.eventInfo);
  }

  setTimestamp(timestamp: number) {
    setTimestamp(this.eventInfo, timestamp);
  }

  getAction() {
    const action = getAction(this.eventInfo);
    if (!action) return undefined;
    return {
      name: action[0],
      element: action[1],
    };
  }

  setAction(action: ActionInfo | undefined) {
    if (!action) {
      unsetAction(this.eventInfo);
      return;
    }
    setAction(this.eventInfo, action.name, action.element);
  }

  getIsReplay() {
    return getIsReplay(this.eventInfo);
  }

  setIsReplay(replay: boolean) {
    setIsReplay(this.eventInfo, replay);
  }

  getResolved() {
    return getResolved(this.eventInfo);
  }

  setResolved(resolved: boolean) {
    setResolved(this.eventInfo, resolved);
  }

  clone() {
    return new EventInfoWrapper(cloneEventInfo(this.eventInfo));
  }
}
