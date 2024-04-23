/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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

import * as a11yClickLib from './a11y_click';
import {Attribute} from './attribute';
import * as cache from './cache';
import {Char} from './char';
import {EarlyJsactionData} from './earlyeventcontract';
import * as eventLib from './event';
import {EventContractContainerManager} from './event_contract_container';
import {
  A11Y_CLICK_SUPPORT,
  CUSTOM_EVENT_SUPPORT,
  JSNAMESPACE_SUPPORT,
  MOUSE_SPECIAL_SUPPORT,
  STOP_PROPAGATION,
} from './event_contract_defines';
import * as eventInfoLib from './event_info';
import {EventType} from './event_type';
import {Property} from './property';
import {Restriction} from './restriction';

/**
 * The API of an EventContract that is safe to call from any compilation unit.
 */
export declare interface UnrenamedEventContract {
  // Alias for Jsction EventContract registerDispatcher.
  ecrd(dispatcher: Dispatcher, restriction: Restriction): void;
  // Unrenamed function. Abbreviation for `eventContract.addA11yClickSupport`.
  ecaacs?: (
    updateEventInfoForA11yClick: typeof a11yClickLib.updateEventInfoForA11yClick,
    preventDefaultForA11yClick: typeof a11yClickLib.preventDefaultForA11yClick,
    populateClickOnlyAction: typeof a11yClickLib.populateClickOnlyAction,
  ) => void;
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

const DEFAULT_EVENT_TYPE: string = EventType.CLICK;

/**
 * Since maps from event to action are immutable we can use a single map
 * to represent the empty map.
 */
const EMPTY_ACTION_MAP: {[key: string]: string} = {};

/**
 * This regular expression matches a semicolon.
 */
const REGEXP_SEMICOLON = /\s*;\s*/;

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
export class EventContract implements UnrenamedEventContract {
  static CUSTOM_EVENT_SUPPORT = CUSTOM_EVENT_SUPPORT;
  static STOP_PROPAGATION = STOP_PROPAGATION;
  static A11Y_CLICK_SUPPORT = A11Y_CLICK_SUPPORT;
  static MOUSE_SPECIAL_SUPPORT = MOUSE_SPECIAL_SUPPORT;
  static JSNAMESPACE_SUPPORT = JSNAMESPACE_SUPPORT;

  private containerManager: EventContractContainerManager | null;

  /**
   * The DOM events which this contract covers. Used to prevent double
   * registration of event types. The value of the map is the
   * internally created DOM event handler function that handles the
   * DOM events. See addEvent().
   *
   */
  private eventHandlers: {[key: string]: EventHandler} = {};

  private browserEventTypeToExtraEventTypes: {[key: string]: string[]} = {};

  /**
   * The dispatcher function. Events are passed to this function for
   * handling once it was set using the registerDispatcher() method. This is
   * done because the function is passed from another jsbinary, so passing the
   * instance and invoking the method here would require to leave the method
   * unobfuscated.
   */
  private dispatcher: Dispatcher | null = null;

  /**
   * The list of suspended `EventInfo` that will be dispatched
   * as soon as the `Dispatcher` is registered.
   */
  private queuedEventInfos: eventInfoLib.EventInfo[] | null = [];

  /** Whether a11y click support has been loaded or not. */
  private hasA11yClickSupport = false;
  /** Whether to add an a11y click listener. */
  private addA11yClickListener = false;

  private updateEventInfoForA11yClick?: (eventInfo: eventInfoLib.EventInfo) => void = undefined;

  private preventDefaultForA11yClick?: (eventInfo: eventInfoLib.EventInfo) => void = undefined;

  private populateClickOnlyAction?: (
    actionElement: Element,
    eventInfo: eventInfoLib.EventInfo,
    actionMap: {[key: string]: string},
  ) => void = undefined;

  ecaacs?: (
    updateEventInfoForA11yClick: typeof a11yClickLib.updateEventInfoForA11yClick,
    preventDefaultForA11yClick: typeof a11yClickLib.preventDefaultForA11yClick,
    populateClickOnlyAction: typeof a11yClickLib.populateClickOnlyAction,
  ) => void;

  constructor(containerManager: EventContractContainerManager) {
    this.containerManager = containerManager;
    if (EventContract.CUSTOM_EVENT_SUPPORT) {
      this.addEvent(EventType.CUSTOM);
    }
    if (EventContract.A11Y_CLICK_SUPPORT) {
      // Add a11y click support to the `EventContract`.
      this.addA11yClickSupport();
    }
  }

  private handleEvent(eventType: string, event: Event, container: Element) {
    const eventInfo = eventInfoLib.createEventInfoFromParameters(
      /* eventType= */ eventType,
      /* event= */ event,
      /* targetElement= */ event.target as Element,
      /* container= */ container,
      /* timestamp= */ Date.now(),
    );
    this.handleEventInfo(eventInfo);
  }

  /**
   * Handle an `EventInfo`.
   */
  private handleEventInfo(eventInfo: eventInfoLib.EventInfo) {
    if (!this.dispatcher) {
      // All events are queued when the dispatcher isn't yet loaded.
      eventInfoLib.setIsReplay(eventInfo, true);
      this.queuedEventInfos?.push(eventInfo);
    }
    if (
      EventContract.CUSTOM_EVENT_SUPPORT &&
      eventInfoLib.getEventType(eventInfo) === EventType.CUSTOM
    ) {
      const detail = (eventInfoLib.getEvent(eventInfo) as CustomEvent).detail;
      // For custom events, use a secondary dispatch based on the internal
      // custom type of the event.
      if (!detail || !detail['_type']) {
        // This should never happen.
        return;
      }
      eventInfoLib.setEventType(eventInfo, detail['_type']);
    }

    this.populateAction(eventInfo);

    if (!this.dispatcher) {
      return;
    }
    const globalEventInfo: eventInfoLib.EventInfo = eventInfoLib.cloneEventInfo(eventInfo);

    // In some cases, `populateAction` will rewrite `click` events to
    // `clickonly`. Revert back to a regular click, otherwise we won't be able
    // to execute global event handlers registered on click events.
    if (eventInfoLib.getEventType(globalEventInfo) === EventType.CLICKONLY) {
      eventInfoLib.setEventType(globalEventInfo, EventType.CLICK);
    }

    this.dispatcher(globalEventInfo, /* dispatch global event */ true);

    const action = eventInfoLib.getAction(eventInfo);
    if (!action) {
      return;
    }
    if (shouldPreventDefaultBeforeDispatching(eventInfoLib.getActionElement(action), eventInfo)) {
      eventLib.preventDefault(eventInfoLib.getEvent(eventInfo));
    }

    this.dispatcher(eventInfo);
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
  private populateAction(eventInfo: eventInfoLib.EventInfo) {
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
      eventInfoLib.getEventType(eventInfo) === EventType.CLICK &&
      eventLib.isModifiedClickEvent(eventInfoLib.getEvent(eventInfo))
    ) {
      eventInfoLib.setEventType(eventInfo, EventType.CLICKMOD);
    } else if (this.hasA11yClickSupport) {
      this.updateEventInfoForA11yClick!(eventInfo);
    }

    // Walk to the parent node, unless the node has a different owner in
    // which case we walk to the owner. Attempt to walk to host of a
    // shadow root if needed.
    let actionElement: Element | null = eventInfoLib.getTargetElement(eventInfo);
    while (actionElement && actionElement !== eventInfoLib.getContainer(eventInfo)) {
      this.populateActionOnElement(actionElement, eventInfo);

      if (eventInfoLib.getAction(eventInfo)) {
        // An event is handled by at most one jsaction. Thus we stop at the
        // first matching jsaction specified in a jsaction attribute up the
        // ancestor chain of the event target node.
        break;
      }
      if (actionElement[Property.OWNER]) {
        actionElement = actionElement[Property.OWNER] as Element;
        continue;
      }
      if (actionElement.parentNode?.nodeName !== '#document-fragment') {
        actionElement = actionElement.parentNode as Element | null;
      } else {
        actionElement = (actionElement.parentNode as ShadowRoot | null)?.host ?? null;
      }
    }

    const action = eventInfoLib.getAction(eventInfo);
    if (!action) {
      // No action found.
      return;
    }

    if (this.hasA11yClickSupport) {
      this.preventDefaultForA11yClick!(eventInfo);
    }

    // We attempt to handle the mouseenter/mouseleave events here by
    // detecting whether the mouseover/mouseout events correspond to
    // entering/leaving an element.
    if (
      EventContract.MOUSE_SPECIAL_SUPPORT &&
      (eventInfoLib.getEventType(eventInfo) === EventType.MOUSEENTER ||
        eventInfoLib.getEventType(eventInfo) === EventType.MOUSELEAVE ||
        eventInfoLib.getEventType(eventInfo) === EventType.POINTERENTER ||
        eventInfoLib.getEventType(eventInfo) === EventType.POINTERLEAVE)
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

  /**
   * Accesses the jsaction map on a node and retrieves the name of the
   * action the given event is mapped to, if any. It parses the
   * attribute value and stores it in a property on the node for
   * subsequent retrieval without re-parsing and re-accessing the
   * attribute. In order to fully qualify jsaction names using a
   * namespace, the DOM is searched starting at the current node and
   * going through ancestor nodes until a jsnamespace attribute is
   * found.
   *
   * @param actionElement The DOM node to retrieve the jsaction map from.
   * @param eventInfo `EventInfo` to set `action` and `actionElement` if an
   *    action is found on the `actionElement`.
   */
  private populateActionOnElement(actionElement: Element, eventInfo: eventInfoLib.EventInfo) {
    const actionMap = parseActions(actionElement, eventInfoLib.getContainer(eventInfo));

    const actionName = actionMap[eventInfoLib.getEventType(eventInfo)];
    if (actionName !== undefined) {
      eventInfoLib.setAction(eventInfo, actionName, actionElement);
    }

    if (this.hasA11yClickSupport) {
      this.populateClickOnlyAction!(actionElement, eventInfo, actionMap);
    }
  }

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
   */
  addEvent(eventType: string, prefixedEventType?: string) {
    if (eventType in this.eventHandlers || !this.containerManager) {
      return;
    }

    if (
      !EventContract.MOUSE_SPECIAL_SUPPORT &&
      (eventType === EventType.MOUSEENTER ||
        eventType === EventType.MOUSELEAVE ||
        eventType === EventType.POINTERENTER ||
        eventType === EventType.POINTERLEAVE)
    ) {
      return;
    }

    const eventHandler = (eventType: string, event: Event, container: Element) => {
      this.handleEvent(eventType, event, container);
    };

    // Store the callback to allow us to replay events.
    this.eventHandlers[eventType] = eventHandler;

    const browserEventType = eventLib.getBrowserEventType(prefixedEventType || eventType);

    if (browserEventType !== eventType) {
      const eventTypes = this.browserEventTypeToExtraEventTypes[browserEventType] || [];
      eventTypes.push(eventType);
      this.browserEventTypeToExtraEventTypes[browserEventType] = eventTypes;
    }

    this.containerManager.addEventListener(browserEventType, (element: Element) => {
      return (event: Event) => {
        eventHandler(eventType, event, element);
      };
    });

    // Automatically install a keypress/keydown event handler if support for
    // accessible clicks is turned on.
    if (this.addA11yClickListener && eventType === EventType.CLICK) {
      this.addEvent(EventType.KEYDOWN);
    }
  }

  /**
   * Gets the queued early events and replay them using the appropriate handler
   * in the provided event contract. Once all the events are replayed, it cleans
   * up the early contract.
   */
  replayEarlyEvents() {
    // Check if the early contract is present and prevent calling this function
    // more than once.
    const earlyJsactionData: EarlyJsactionData | undefined = window._ejsa;
    if (!earlyJsactionData) {
      return;
    }

    // Replay the early contract events.
    const earlyEventInfos: eventInfoLib.EventInfo[] = earlyJsactionData.q;
    for (let idx = 0; idx < earlyEventInfos.length; idx++) {
      const earlyEventInfo: eventInfoLib.EventInfo = earlyEventInfos[idx];
      const eventTypes = this.getEventTypesForBrowserEventType(earlyEventInfo.eventType);
      for (let i = 0; i < eventTypes.length; i++) {
        const eventInfo = eventInfoLib.cloneEventInfo(earlyEventInfo);
        // EventInfo eventType maps to JSAction's internal event type,
        // rather than the browser event type.
        eventInfoLib.setEventType(eventInfo, eventTypes[i]);
        this.handleEventInfo(eventInfo);
      }
    }

    // Clean up the early contract.
    const earlyEventTypes: string[] = earlyJsactionData.et;
    const earlyEventHandler: (event: Event) => void = earlyJsactionData.h;
    for (let idx = 0; idx < earlyEventTypes.length; idx++) {
      const eventType: string = earlyEventTypes[idx];
      window.document.documentElement.removeEventListener(eventType, earlyEventHandler);
    }
    delete window._ejsa;
  }

  /**
   * Returns all JSAction event types that have been registered for a given
   * browser event type.
   */
  private getEventTypesForBrowserEventType(browserEventType: string) {
    const eventTypes = [];
    if (this.eventHandlers[browserEventType]) {
      eventTypes.push(browserEventType);
    }
    if (this.browserEventTypeToExtraEventTypes[browserEventType]) {
      eventTypes.push(...this.browserEventTypeToExtraEventTypes[browserEventType]);
    }
    return eventTypes;
  }

  /**
   * Returns the event handler function for a given event type.
   */
  handler(eventType: string): EventHandler | undefined {
    return this.eventHandlers[eventType];
  }

  /**
   * Cleans up the event contract. This resets all of the `EventContract`'s
   * internal state. Users are responsible for not using this `EventContract`
   * after it has been cleaned up.
   */
  cleanUp() {
    this.containerManager!.cleanUp();
    this.containerManager = null;
    this.eventHandlers = {};
    this.browserEventTypeToExtraEventTypes = {};
    this.dispatcher = null;
    this.queuedEventInfos = [];
  }

  /**
   * Register a dispatcher function. Event info of each event mapped to
   * a jsaction is passed for handling to this callback. The queued
   * events are passed as well to the dispatcher for later replaying
   * once the dispatcher is registered. Clears the event queue to null.
   *
   * @param dispatcher The dispatcher function.
   * @param restriction
   */
  registerDispatcher(dispatcher: Dispatcher, restriction: Restriction) {
    this.ecrd(dispatcher, restriction);
  }

  /**
   * Unrenamed alias for registerDispatcher. Necessary for any codebases that
   * split the `EventContract` and `Dispatcher` code into different compilation
   * units.
   */
  ecrd(dispatcher: Dispatcher, restriction: Restriction) {
    this.dispatcher = dispatcher;

    if (this.queuedEventInfos?.length) {
      for (let i = 0; i < this.queuedEventInfos.length; i++) {
        this.handleEventInfo(this.queuedEventInfos[i]);
      }
      this.queuedEventInfos = null;
    }
  }

  /**
   * Adds a11y click support to the given `EventContract`. Meant to be called in
   * the same compilation unit as the `EventContract`.
   */
  addA11yClickSupport() {
    this.addA11yClickSupportImpl(
      a11yClickLib.updateEventInfoForA11yClick,
      a11yClickLib.preventDefaultForA11yClick,
      a11yClickLib.populateClickOnlyAction,
    );
  }

  /**
   * Enables a11y click support to be deferred. Meant to be called in the same
   * compilation unit as the `EventContract`.
   */
  exportAddA11yClickSupport() {
    this.addA11yClickListener = true;
    this.ecaacs = this.addA11yClickSupportImpl.bind(this);
  }

  /**
   * Unrenamed function that loads a11yClickSupport.
   */
  private addA11yClickSupportImpl(
    updateEventInfoForA11yClick: typeof a11yClickLib.updateEventInfoForA11yClick,
    preventDefaultForA11yClick: typeof a11yClickLib.preventDefaultForA11yClick,
    populateClickOnlyAction: typeof a11yClickLib.populateClickOnlyAction,
  ) {
    this.addA11yClickListener = true;
    this.hasA11yClickSupport = true;
    this.updateEventInfoForA11yClick = updateEventInfoForA11yClick;
    this.preventDefaultForA11yClick = preventDefaultForA11yClick;
    this.populateClickOnlyAction = populateClickOnlyAction;
  }
}

/**
 * Adds a11y click support to the given `EventContract`. Meant to be called
 * in a different compilation unit from the `EventContract`. The `EventContract`
 * must have called `exportAddA11yClickSupport` in its compilation unit for this
 * to have any effect.
 */
export function addDeferredA11yClickSupport(eventContract: EventContract) {
  eventContract.ecaacs?.(
    a11yClickLib.updateEventInfoForA11yClick,
    a11yClickLib.preventDefaultForA11yClick,
    a11yClickLib.populateClickOnlyAction,
  );
}

/**
 * Returns true if the default action of this event should be prevented before
 * this event is dispatched.
 */
function shouldPreventDefaultBeforeDispatching(
  actionElement: Element,
  eventInfo: eventInfoLib.EventInfo,
): boolean {
  // Prevent browser from following <a> node links if a jsaction is present
  // and we are dispatching the action now. Note that the targetElement may be
  // a child of an anchor that has a jsaction attached. For that reason, we
  // need to check the actionElement rather than the targetElement.
  return (
    actionElement.tagName === 'A' &&
    (eventInfoLib.getEventType(eventInfo) === EventType.CLICK ||
      eventInfoLib.getEventType(eventInfo) === EventType.CLICKMOD)
  );
}

/**
 * Parses and caches an element's jsaction element into a map.
 *
 * This is primarily for internal use.
 *
 * @param actionElement The DOM node to retrieve the jsaction map from.
 * @param container The node which limits the namespace lookup for a jsaction
 * name. The container node itself will not be searched.
 * @return Map from event to qualified name of the jsaction bound to it.
 */
export function parseActions(actionElement: Element, container: Node): {[key: string]: string} {
  let actionMap: {[key: string]: string} | undefined = cache.get(actionElement);
  if (!actionMap) {
    const jsactionAttribute = getAttr(actionElement, Attribute.JSACTION);
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
          const type = hasColon ? stringTrim(value.substr(0, colon)) : DEFAULT_EVENT_TYPE;
          const action = hasColon ? stringTrim(value.substr(colon + 1)) : value;
          actionMap[type] = action;
        }
        cache.setParsed(jsactionAttribute, actionMap);
      }
      // If namespace support is active we need to augment the (potentially
      // cached) jsaction mapping with the namespace.
      if (EventContract.JSNAMESPACE_SUPPORT) {
        const noNs = actionMap;
        actionMap = {};
        for (const type in noNs) {
          actionMap[type] = getFullyQualifiedAction(noNs[type], actionElement, container);
        }
      }
      cache.set(actionElement, actionMap);
    }
  }
  return actionMap;
}

/**
 * Returns the fully qualified jsaction action. If the given jsaction
 * name doesn't already contain the namespace, the function iterates
 * over ancestor nodes until a jsnamespace attribute is found, and
 * uses the value of that attribute as the namespace.
 *
 * @param action The jsaction action to resolve.
 * @param start The node from which to start searching for a jsnamespace
 * attribute.
 * @param container The node which limits the search for a jsnamespace
 * attribute. This node will be searched.
 * @return The fully qualified name of the jsaction. If no namespace is found,
 * returns the unqualified name in case it exists in the global namespace.
 */
function getFullyQualifiedAction(action: string, start: Element, container: Node): string {
  if (EventContract.JSNAMESPACE_SUPPORT) {
    if (isNamespacedAction(action)) {
      return action;
    }

    let node: Node | null = start;
    while (node) {
      const namespace = getNamespaceFromElement(node as Element);
      if (namespace) {
        return namespace + Char.NAMESPACE_ACTION_SEPARATOR + action;
      }

      // If this node is the container, stop.
      if (node === container) {
        break;
      }

      node = node.parentNode;
    }
  }

  return action;
}

/**
 * Checks if a jsaction action contains a namespace part.
 */
function isNamespacedAction(action: string): boolean {
  return action.indexOf(Char.NAMESPACE_ACTION_SEPARATOR) >= 0;
}

/**
 * Returns the value of the jsnamespace attribute of the given node.
 * Also caches the value for subsequent lookups.
 * @param element The node whose jsnamespace attribute is being asked for.
 * @return The value of the jsnamespace attribute, or null if not found.
 */
function getNamespaceFromElement(element: Element): string | null {
  let namespace = cache.getNamespace(element);
  // Only query for the attribute if it has not been queried for
  // before. getAttr() returns null if an attribute is not present. Thus,
  // namespace is string|null if the query took place in the past, or
  // undefined if the query did not take place.
  if (namespace === undefined) {
    namespace = getAttr(element, Attribute.JSNAMESPACE);
    cache.setNamespace(element, namespace);
  }
  return namespace;
}

/**
 * Accesses the event handler attribute value of a DOM node. It guards
 * against weird situations (described in the body) that occur in
 * connection with nodes that are removed from their document.
 * @param element The DOM element.
 * @param attribute The name of the attribute to access.
 * @return The attribute value if it was found, null otherwise.
 */
function getAttr(element: Element, attribute: string): string | null {
  let value = null;
  // NOTE: Nodes in IE do not always have a getAttribute
  // method defined. This is the case where sourceElement has in
  // fact been removed from the DOM before eventContract begins
  // handling - where a parentNode does not have getAttribute
  // defined.
  // NOTE: We must use the 'in' operator instead of the regular dot
  // notation, since the latter fails in IE8 if the getAttribute method is not
  // defined. See b/7139109.
  if ('getAttribute' in element) {
    value = element.getAttribute(attribute);
  }
  return value;
}

/**
 * Helper function to trim whitespace from the beginning and the end
 * of the string. This deliberately doesn't use the closure equivalent
 * to keep dependencies small.
 * @param str  Input string.
 * @return  Trimmed string.
 */
function stringTrim(str: string): string {
  if (typeof String.prototype.trim === 'function') {
    return str.trim();
  }

  const trimmedLeft = str.replace(/^\s+/, '');
  return trimmedLeft.replace(/\s+$/, '');
}
