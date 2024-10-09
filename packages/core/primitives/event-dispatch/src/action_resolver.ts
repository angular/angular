/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Attribute} from './attribute';
import {Char} from './char';
import {EventType} from './event_type';
import {Property} from './property';
import * as a11yClick from './a11y_click';
import * as cache from './cache';
import * as eventInfoLib from './event_info';
import * as eventLib from './event';

/**
 * Since maps from event to action are immutable we can use a single map
 * to represent the empty map.
 */
const EMPTY_ACTION_MAP: {[key: string]: string} = {};

/**
 * This regular expression matches a semicolon.
 */
const REGEXP_SEMICOLON = /\s*;\s*/;

/** If no event type is defined, defaults to `click`. */
const DEFAULT_EVENT_TYPE: string = EventType.CLICK;

/** Resolves actions for Events. */
export class ActionResolver {
  private a11yClickSupport: boolean = false;
  private clickModSupport: boolean = true;
  private readonly syntheticMouseEventSupport: boolean;

  private updateEventInfoForA11yClick?: (eventInfo: eventInfoLib.EventInfo) => void = undefined;

  private preventDefaultForA11yClick?: (eventInfo: eventInfoLib.EventInfo) => void = undefined;

  private populateClickOnlyAction?: (
    actionElement: Element,
    eventInfo: eventInfoLib.EventInfo,
    actionMap: {[key: string]: string | undefined},
  ) => void = undefined;

  constructor({
    syntheticMouseEventSupport = false,
    clickModSupport = true,
  }: {
    syntheticMouseEventSupport?: boolean;
    clickModSupport?: boolean;
  } = {}) {
    this.syntheticMouseEventSupport = syntheticMouseEventSupport;
    this.clickModSupport = clickModSupport;
  }

  resolveEventType(eventInfo: eventInfoLib.EventInfo) {
    // We distinguish modified and plain clicks in order to support the
    // default browser behavior of modified clicks on links; usually to
    // open the URL of the link in new tab or new window on ctrl/cmd
    // click. A DOM 'click' event is mapped to the jsaction 'click'
    // event iff there is no modifier present on the event. If there is
    // a modifier, it's mapped to 'clickmod' instead.
    //
    // It's allowed to omit the event in the jsaction attribute. In that
    // case, 'click' is assumed. Thus the following two are equivalent:
    //
    //   <a href="someurl" jsaction="gna.fu">
    //   <a href="someurl" jsaction="click:gna.fu">
    //
    // For unmodified clicks, EventContract invokes the jsaction
    // 'gna.fu'. For modified clicks, EventContract won't find a
    // suitable action and leave the event to be handled by the
    // browser.
    //
    // In order to also invoke a jsaction handler for a modifier click,
    // 'clickmod' needs to be used:
    //
    //   <a href="someurl" jsaction="clickmod:gna.fu">
    //
    // EventContract invokes the jsaction 'gna.fu' for modified
    // clicks. Unmodified clicks are left to the browser.
    //
    // In order to set up the event contract to handle both clickonly and
    // clickmod, only addEvent(EventType.CLICK) is necessary.
    //
    // In order to set up the event contract to handle click,
    // addEvent() is necessary for CLICK, KEYDOWN, and KEYPRESS event types.  If
    // a11y click support is enabled, addEvent() will set up the appropriate key
    // event handler automatically.
    if (
      this.clickModSupport &&
      eventInfoLib.getEventType(eventInfo) === EventType.CLICK &&
      eventLib.isModifiedClickEvent(eventInfoLib.getEvent(eventInfo))
    ) {
      eventInfoLib.setEventType(eventInfo, EventType.CLICKMOD);
    } else if (this.a11yClickSupport) {
      this.updateEventInfoForA11yClick!(eventInfo);
    }
  }

  resolveAction(eventInfo: eventInfoLib.EventInfo) {
    if (eventInfoLib.getResolved(eventInfo)) {
      return;
    }
    this.populateAction(eventInfo, eventInfoLib.getTargetElement(eventInfo));
    eventInfoLib.setResolved(eventInfo, true);
  }

  resolveParentAction(eventInfo: eventInfoLib.EventInfo) {
    const action = eventInfoLib.getAction(eventInfo);
    const actionElement = action && eventInfoLib.getActionElement(action);
    eventInfoLib.unsetAction(eventInfo);
    const parentNode = actionElement && this.getParentNode(actionElement);
    if (!parentNode) {
      return;
    }
    this.populateAction(eventInfo, parentNode);
  }

  /**
   * Searches for a jsaction that the DOM event maps to and creates an
   * object containing event information used for dispatching by
   * jsaction.Dispatcher. This method populates the `action` and `actionElement`
   * fields of the EventInfo object passed in by finding the first
   * jsaction attribute above the target Node of the event, and below
   * the container Node, that specifies a jsaction for the event
   * type. If no such jsaction is found, then action is undefined.
   *
   * @param eventInfo `EventInfo` to set `action` and `actionElement` if an
   *    action is found on any `Element` in the path of the `Event`.
   */
  private populateAction(eventInfo: eventInfoLib.EventInfo, currentTarget: Element) {
    let actionElement: Element | null = currentTarget;
    while (actionElement && actionElement !== eventInfoLib.getContainer(eventInfo)) {
      if (actionElement.nodeType === Node.ELEMENT_NODE) {
        this.populateActionOnElement(actionElement, eventInfo);
      }

      if (eventInfoLib.getAction(eventInfo)) {
        // An event is handled by at most one jsaction. Thus we stop at the
        // first matching jsaction specified in a jsaction attribute up the
        // ancestor chain of the event target node.
        break;
      }
      actionElement = this.getParentNode(actionElement);
    }

    const action = eventInfoLib.getAction(eventInfo);
    if (!action) {
      // No action found.
      return;
    }

    if (this.a11yClickSupport) {
      this.preventDefaultForA11yClick!(eventInfo);
    }

    // We attempt to handle the mouseenter/mouseleave events here by
    // detecting whether the mouseover/mouseout events correspond to
    // entering/leaving an element.
    if (this.syntheticMouseEventSupport) {
      if (
        eventInfoLib.getEventType(eventInfo) === EventType.MOUSEENTER ||
        eventInfoLib.getEventType(eventInfo) === EventType.MOUSELEAVE ||
        eventInfoLib.getEventType(eventInfo) === EventType.POINTERENTER ||
        eventInfoLib.getEventType(eventInfo) === EventType.POINTERLEAVE
      ) {
        // We attempt to handle the mouseenter/mouseleave events here by
        // detecting whether the mouseover/mouseout events correspond to
        // entering/leaving an element.
        if (
          eventLib.isMouseSpecialEvent(
            eventInfoLib.getEvent(eventInfo),
            eventInfoLib.getEventType(eventInfo),
            eventInfoLib.getActionElement(action),
          )
        ) {
          // If both mouseover/mouseout and mouseenter/mouseleave events are
          // enabled, two separate handlers for mouseover/mouseout are
          // registered. Both handlers will see the same event instance
          // so we create a copy to avoid interfering with the dispatching of
          // the mouseover/mouseout event.
          const copiedEvent = eventLib.createMouseSpecialEvent(
            eventInfoLib.getEvent(eventInfo),
            eventInfoLib.getActionElement(action),
          );
          eventInfoLib.setEvent(eventInfo, copiedEvent);
          // Since the mouseenter/mouseleave events do not bubble, the target
          // of the event is technically the `actionElement` (the node with the
          // `jsaction` attribute)
          eventInfoLib.setTargetElement(eventInfo, eventInfoLib.getActionElement(action));
        } else {
          eventInfoLib.unsetAction(eventInfo);
        }
      }
    }
  }

  /**
   * Walk to the parent node, unless the node has a different owner in
   * which case we walk to the owner. Attempt to walk to host of a
   * shadow root if needed.
   */
  private getParentNode(element: Element): Element | null {
    const owner = element[Property.OWNER];
    if (owner) {
      return owner as Element;
    }
    const parentNode = element.parentNode;
    if (parentNode?.nodeName === '#document-fragment') {
      return (parentNode as ShadowRoot | null)?.host ?? null;
    }
    return parentNode as Element | null;
  }

  /**
   * Accesses the jsaction map on a node and retrieves the name of the
   * action the given event is mapped to, if any. It parses the
   * attribute value and stores it in a property on the node for
   * subsequent retrieval without re-parsing and re-accessing the
   * attribute.
   *
   * @param actionElement The DOM node to retrieve the jsaction map from.
   * @param eventInfo `EventInfo` to set `action` and `actionElement` if an
   *    action is found on the `actionElement`.
   */
  private populateActionOnElement(actionElement: Element, eventInfo: eventInfoLib.EventInfo) {
    const actionMap = this.parseActions(actionElement);

    const actionName = actionMap[eventInfoLib.getEventType(eventInfo)];
    if (actionName !== undefined) {
      eventInfoLib.setAction(eventInfo, actionName, actionElement);
    }

    if (this.a11yClickSupport) {
      this.populateClickOnlyAction!(actionElement, eventInfo, actionMap);
    }
  }

  /**
   * Parses and caches an element's jsaction element into a map.
   *
   * This is primarily for internal use.
   *
   * @param actionElement The DOM node to retrieve the jsaction map from.
   * @return Map from event to qualified name of the jsaction bound to it.
   */
  private parseActions(actionElement: Element): {[key: string]: string | undefined} {
    let actionMap: {[key: string]: string | undefined} | undefined = cache.get(actionElement);
    if (!actionMap) {
      const jsactionAttribute = actionElement.getAttribute(Attribute.JSACTION);
      if (!jsactionAttribute) {
        actionMap = EMPTY_ACTION_MAP;
        cache.set(actionElement, actionMap);
      } else {
        actionMap = cache.getParsed(jsactionAttribute);
        if (!actionMap) {
          actionMap = {};
          const values = jsactionAttribute.split(REGEXP_SEMICOLON);
          for (let idx = 0; idx < values.length; idx++) {
            const value = values[idx];
            if (!value) {
              continue;
            }
            const colon = value.indexOf(Char.EVENT_ACTION_SEPARATOR);
            const hasColon = colon !== -1;
            const type = hasColon ? value.substr(0, colon).trim() : DEFAULT_EVENT_TYPE;
            const action = hasColon ? value.substr(colon + 1).trim() : value;
            actionMap[type] = action;
          }
          cache.setParsed(jsactionAttribute, actionMap);
        }
        cache.set(actionElement, actionMap);
      }
    }
    return actionMap;
  }

  addA11yClickSupport(
    updateEventInfoForA11yClick: typeof a11yClick.updateEventInfoForA11yClick,
    preventDefaultForA11yClick: typeof a11yClick.preventDefaultForA11yClick,
    populateClickOnlyAction: typeof a11yClick.populateClickOnlyAction,
  ) {
    this.a11yClickSupport = true;
    this.updateEventInfoForA11yClick = updateEventInfoForA11yClick;
    this.preventDefaultForA11yClick = preventDefaultForA11yClick;
    this.populateClickOnlyAction = populateClickOnlyAction;
  }
}
