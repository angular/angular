/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
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
  action: string;
  actionElement: Element|null;
  timeStamp: number;
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
export function getAction(eventInfo: EventInfo) {
  return eventInfo.action;
}

/** Added for readability when accessing stable property names. */
export function setAction(eventInfo: EventInfo, action: string) {
  eventInfo.action = action;
}

/** Added for readability when accessing stable property names. */
export function getActionElement(eventInfo: EventInfo) {
  return eventInfo.actionElement;
}

/** Added for readability when accessing stable property names. */
export function setActionElement(
    eventInfo: EventInfo,
    actionElement: Element|null,
) {
  eventInfo.actionElement = actionElement;
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

/** Clones an `EventInfo` */
export function cloneEventInfo(eventInfo: EventInfo): EventInfo {
  return {
    eventType: eventInfo.eventType,
    event: eventInfo.event,
    targetElement: eventInfo.targetElement,
    eic: eventInfo.eic,
    action: eventInfo.action,
    actionElement: eventInfo.actionElement,
    timeStamp: eventInfo.timeStamp,
    eirp: eventInfo.eirp,
    eiack: eventInfo.eiack,
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
    action: string,
    actionElement: Element|null,
    timestamp: number,
    isReplay?: boolean,
    a11yClickKey?: boolean,
    ): EventInfo {
  return {
    eventType,
    event,
    targetElement,
    eic: container,
    action,
    actionElement,
    timeStamp: timestamp,
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
export function createEventInfo(info: {
  eventType: string; event: Event; targetElement: Element; container: Element; action: string;
  actionElement: Element | null;
  timestamp: number;
  isReplay?: boolean;
  a11yClickKey?: boolean;
}): EventInfo {
  return {
    eventType: info.eventType,
    event: info.event,
    targetElement: info.targetElement,
    eic: info.container,
    action: info.action,
    actionElement: info.actionElement,
    timeStamp: info.timestamp,
    eirp: info.isReplay,
    eiack: info.a11yClickKey,
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

  getAction() {
    return getAction(this.eventInfo);
  }

  setAction(action: string) {
    setAction(this.eventInfo, action);
  }

  getActionElement() {
    return getActionElement(this.eventInfo);
  }

  setActionElement(actionElement: Element|null) {
    setActionElement(this.eventInfo, actionElement);
  }

  getTimestamp() {
    return getTimestamp(this.eventInfo);
  }

  setTimestamp(timestamp: number) {
    setTimestamp(this.eventInfo, timestamp);
  }

  getIsReplay() {
    return getIsReplay(this.eventInfo);
  }

  setIsReplay(replay: boolean) {
    setIsReplay(this.eventInfo, replay);
  }

  clone() {
    return new EventInfoWrapper(cloneEventInfo(this.eventInfo));
  }
}
