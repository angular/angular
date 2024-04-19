/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute as AccessibilityAttribute} from './accessibility';
import {Char} from './char';
import * as eventLib from './event';
import {EventInfo, EventInfoWrapper} from './event_info';
import {EventType} from './event_type';
import {UnrenamedEventContract} from './eventcontract';
import {replayEvent} from './replay';
import {Restriction} from './restriction';

/**
 * A replayer is a function that is called when there are queued events,
 * either from the `EventContract` or when there are no detected handlers.
 */
export type Replayer = (eventInfoWrappers: EventInfoWrapper[], dispatcher: Dispatcher) => void;

/**
 * A global handler is dispatched to before normal handler dispatch. Returning
 * false will `preventDefault` on the event.
 */
export type GlobalHandler = (event: Event) => boolean | void;

/**
 * A handler is dispatched to during normal handling.
 */
export type EventInfoHandler = (eventInfoWrapper: EventInfoWrapper) => void;

/**
 * Receives a DOM event, determines the jsaction associated with the source
 * element of the DOM event, and invokes the handler associated with the
 * jsaction.
 */
export class Dispatcher {
  /**
   * The actions that are registered for this Dispatcher instance.
   * This should be the primary one used once migration off of registerHandlers
   * is done.
   */
  private readonly actions: {[key: string]: EventInfoHandler} = {};

  /** The queue of events. */
  private readonly queuedEventInfos: EventInfoWrapper[] = [];

  /** A map of global event handlers, where each key is an event type. */
  private readonly globalHandlers_ = new Map<string, Set<GlobalHandler>>();

  private eventReplayer: Replayer | null = null;

  private eventReplayScheduled = false;

  private readonly stopPropagation: boolean;

  /**
   * Receives a DOM event, determines the jsaction associated with the source
   * element of the DOM event, and invokes the handler associated with the
   * jsaction.
   *
   * @param getHandler A function that knows how to get the handler for a
   *     given event info.
   */
  constructor(
    private readonly getHandler?: (eventInfoWrapper: EventInfoWrapper) => EventInfoHandler | void,
    {stopPropagation = false}: {stopPropagation?: boolean} = {},
  ) {
    this.stopPropagation = stopPropagation;
  }

  /**
   * Receives an event or the event queue from the EventContract. The event
   * queue is copied and it attempts to replay.
   * If event info is passed in it looks for an action handler that can handle
   * the given event.  If there is no handler registered queues the event and
   * checks if a loader is registered for the given namespace. If so, calls it.
   *
   * Alternatively, if in global dispatch mode, calls all registered global
   * handlers for the appropriate event type.
   *
   * The three functionalities of this call are deliberately not split into
   * three methods (and then declared as an abstract interface), because the
   * interface is used by EventContract, which lives in a different jsbinary.
   * Therefore the interface between the three is defined entirely in terms that
   * are invariant under jscompiler processing (Function and Array, as opposed
   * to a custom type with method names).
   *
   * @param eventInfo The info for the event that triggered this call or the
   *     queue of events from EventContract.
   * @param isGlobalDispatch If true, dispatches a global event instead of a
   *     regular jsaction handler.
   * @return An `EventInfo` for the `EventContract` to handle again if the
   *    `Dispatcher` tried to resolve an a11y event as a click but failed.
   */
  dispatch(eventInfo: EventInfo, isGlobalDispatch?: boolean): EventInfo | void {
    const eventInfoWrapper = new EventInfoWrapper(eventInfo);
    if (eventInfoWrapper.getIsReplay()) {
      if (isGlobalDispatch || !this.eventReplayer) {
        return;
      }
      const resolved = resolveA11yEvent(eventInfoWrapper, isGlobalDispatch);
      if (!resolved) {
        // Send the event back through the `EventContract` by dispatching to
        // the browser.
        replayEvent(
          eventInfoWrapper.getEvent(),
          eventInfoWrapper.getTargetElement(),
          eventInfoWrapper.getEventType(),
        );
        return;
      }
      this.queuedEventInfos.push(eventInfoWrapper);
      this.scheduleEventReplay();
      return;
    }

    const resolved = resolveA11yEvent(eventInfoWrapper, isGlobalDispatch);
    if (!resolved) {
      // Reset action information.
      eventInfoWrapper.setAction(undefined);
      return eventInfoWrapper.eventInfo;
    }

    if (isGlobalDispatch) {
      // Skip everything related to jsaction handlers, and execute the global
      // handlers.
      const ev = eventInfoWrapper.getEvent();
      const eventTypeHandlers = this.globalHandlers_.get(eventInfoWrapper.getEventType());
      let shouldPreventDefault = false;
      if (eventTypeHandlers) {
        for (const handler of eventTypeHandlers) {
          if (handler(ev) === false) {
            shouldPreventDefault = true;
          }
        }
      }
      if (shouldPreventDefault) {
        eventLib.preventDefault(ev);
      }
      return;
    }

    // Stop propagation if there's an action.
    if (this.stopPropagation) {
      stopPropagation(eventInfoWrapper);
    }

    const action = eventInfoWrapper.getAction()!;

    let handler: EventInfoHandler | void = undefined;
    if (this.getHandler) {
      handler = this.getHandler(eventInfoWrapper);
    }

    if (!handler) {
      handler = this.actions[action.name];
    }

    if (handler) {
      handler(eventInfoWrapper);
      return;
    }

    // No handler was found.
    this.queuedEventInfos.push(eventInfoWrapper);
    return;
  }

  /**
   * Registers multiple methods all bound to the same object
   * instance. This is a common case: an application module binds
   * multiple of its methods under public names to the event contract of
   * the application. So we provide a shortcut for it.
   * Attempts to replay the queued events after registering the handlers.
   *
   * @param namespace The namespace of the jsaction name.
   *
   * @param instance The object to bind the methods to. If this is null, then
   *     the functions are not bound, but directly added under the public names.
   *
   * @param methods A map from public name to functions that will be bound to
   *     instance and registered as action under the public name. I.e. the
   *     property names are the public names. The property values are the
   *     methods of instance.
   */
  registerEventInfoHandlers<T>(
    namespace: string,
    instance: T | null,
    methods: {[key: string]: EventInfoHandler},
  ) {
    for (const [name, method] of Object.entries(methods)) {
      const handler = instance ? method.bind(instance) : method;
      if (namespace) {
        // Include a '.' separator between namespace name and action name.
        // In the case that no namespace name is provided, the jsaction name
        // consists of the action name only (no period).
        const fullName = namespace + Char.NAMESPACE_ACTION_SEPARATOR + name;
        this.actions[fullName] = handler;
      } else {
        this.actions[name] = handler;
      }
    }

    this.scheduleEventReplay();
  }

  /**
   * Unregisters an action.  Provided as an easy way to reverse the effects of
   * registerHandlers.
   * @param namespace The namespace of the jsaction name.
   * @param name The action name to unbind.
   */
  unregisterHandler(namespace: string, name: string) {
    const fullName = namespace ? namespace + Char.NAMESPACE_ACTION_SEPARATOR + name : name;
    delete this.actions[fullName];
  }

  /** Registers a global event handler. */
  registerGlobalHandler(eventType: string, handler: GlobalHandler) {
    if (!this.globalHandlers_.has(eventType)) {
      this.globalHandlers_.set(eventType, new Set<GlobalHandler>([handler]));
    } else {
      this.globalHandlers_.get(eventType)!.add(handler);
    }
  }

  /** Unregisters a global event handler. */
  unregisterGlobalHandler(eventType: string, handler: GlobalHandler) {
    if (this.globalHandlers_.has(eventType)) {
      this.globalHandlers_.get(eventType)!.delete(handler);
    }
  }

  /**
   * Checks whether there is an action registered under the given
   * name. This returns true if there is a namespace handler, even
   * if it can not yet handle the event.
   *
   * @param name Action name.
   * @return Whether the name is registered.
   * @see #canDispatch
   */
  hasAction(name: string): boolean {
    return this.actions.hasOwnProperty(name);
  }

  /**
   * Whether this dispatcher can dispatch the event. This can be used by
   * event replayer to check whether the dispatcher can replay an event.
   */
  canDispatch(eventInfoWrapper: EventInfoWrapper): boolean {
    const action = eventInfoWrapper.getAction();
    if (!action) {
      return false;
    }
    return this.hasAction(action.name);
  }

  /**
   * Replays queued events, if any. The replaying will happen in its own
   * stack once the current flow cedes control. This is done to mimic
   * browser event handling.
   */
  private scheduleEventReplay() {
    if (this.eventReplayScheduled || !this.eventReplayer || this.queuedEventInfos.length === 0) {
      return;
    }

    this.eventReplayScheduled = true;
    Promise.resolve().then(() => {
      this.eventReplayScheduled = false;
      this.eventReplayer!(this.queuedEventInfos, this);
    });
  }

  /**
   * Sets the event replayer, enabling queued events to be replayed when actions
   * are bound. To replay events, you must register the dispatcher to the
   * contract after setting the `EventReplayer`. The event replayer takes as
   * parameters the queue of events and the dispatcher (used to check whether
   * actions have handlers registered and can be replayed). The event replayer
   * is also responsible for dequeuing events.
   *
   * Example: An event replayer that replays only the last event.
   *
   *   const dispatcher = new Dispatcher();
   *   // ...
   *   dispatcher.setEventReplayer((queue, dispatcher) => {
   *     const lastEventInfoWrapper = queue[queue.length -1];
   *     if (dispatcher.canDispatch(lastEventInfoWrapper.getAction())) {
   *       jsaction.replay.replayEvent(
   *           lastEventInfoWrapper.getEvent(),
   *           lastEventInfoWrapper.getTargetElement(),
   *           lastEventInfoWrapper.getEventType(),
   *       );
   *       queue.length = 0;
   *     }
   *   });
   *
   * @param eventReplayer It allows elements to be replayed and dequeuing.
   */
  setEventReplayer(eventReplayer: Replayer) {
    this.eventReplayer = eventReplayer;
  }
}

/**
 * If a 'MAYBE_CLICK_EVENT_TYPE' event was dispatched, updates the eventType
 * to either click or keydown based on whether the keydown action can be
 * treated as a click. For MAYBE_CLICK_EVENT_TYPE events that are just
 * keydowns, we set flags on the event object so that the event contract
 * does't try to dispatch it as a MAYBE_CLICK_EVENT_TYPE again.
 *
 * @param isGlobalDispatch Whether the eventInfo is meant to be dispatched to
 *     the global handlers.
 * @return Returns false if the a11y event could not be resolved and should
 *    be re-dispatched.
 */
function resolveA11yEvent(eventInfoWrapper: EventInfoWrapper, isGlobalDispatch = false): boolean {
  if (eventInfoWrapper.getEventType() !== AccessibilityAttribute.MAYBE_CLICK_EVENT_TYPE) {
    return true;
  }

  if (isA11yClickEvent(eventInfoWrapper, isGlobalDispatch)) {
    if (shouldPreventDefault(eventInfoWrapper)) {
      eventLib.preventDefault(eventInfoWrapper.getEvent());
    }
    // If the keydown event can be treated as a click, we change the eventType
    // to 'click' so that the dispatcher can retrieve the right handler for
    // it. Even though EventInfo['action'] corresponds to the click action,
    // the global handler and any custom 'getHandler' implementations may rely
    // on the eventType instead.
    eventInfoWrapper.setEventType(EventType.CLICK);
  } else {
    // Otherwise, if the keydown can't be treated as a click, we need to
    // retrigger it because now we need to look for 'keydown' actions instead.
    eventInfoWrapper.setEventType(EventType.KEYDOWN);
    if (!isGlobalDispatch) {
      // This prevents the event contract from setting the
      // AccessibilityAttribute.MAYBE_CLICK_EVENT_TYPE type for Keydown
      // events.
      eventInfoWrapper.getEvent()[AccessibilityAttribute.SKIP_A11Y_CHECK] = true;
      // Since globally dispatched events will get handled by the dispatcher,
      // don't have the event contract dispatch it again.
      eventInfoWrapper.getEvent()[AccessibilityAttribute.SKIP_GLOBAL_DISPATCH] = true;
      return false;
    }
  }
  return true;
}

/**
 * Returns true if the default action for this event should be prevented
 * before the event handler is envoked.
 */
function shouldPreventDefault(eventInfoWrapper: EventInfoWrapper): boolean {
  const actionElement = eventInfoWrapper.getAction()?.element;
  // For parity with no-a11y-support behavior.
  if (!actionElement) {
    return false;
  }
  // Prevent scrolling if the Space key was pressed
  if (eventLib.isSpaceKeyEvent(eventInfoWrapper.getEvent())) {
    return true;
  }
  // or prevent the browser's default action for native HTML controls.
  if (eventLib.shouldCallPreventDefaultOnNativeHtmlControl(eventInfoWrapper.getEvent())) {
    return true;
  }
  // Prevent browser from following <a> node links if a jsaction is present
  // and we are dispatching the action now. Note that the targetElement may be
  // a child of an anchor that has a jsaction attached. For that reason, we
  // need to check the actionElement rather than the targetElement.
  if (actionElement.tagName === 'A') {
    return true;
  }
  return false;
}

/**
 * Returns true if the given key event can be treated as a 'click'.
 *
 * @param isGlobalDispatch Whether the eventInfo is meant to be dispatched to
 *     the global handlers.
 */
function isA11yClickEvent(eventInfoWrapper: EventInfoWrapper, isGlobalDispatch?: boolean): boolean {
  return (
    (isGlobalDispatch || eventInfoWrapper.getAction() !== undefined) &&
    eventLib.isActionKeyEvent(eventInfoWrapper.getEvent())
  );
}

/**
 * Registers deferred functionality for an EventContract and a Jsaction
 * Dispatcher.
 */
export function registerDispatcher(eventContract: UnrenamedEventContract, dispatcher: Dispatcher) {
  eventContract.ecrd((eventInfo: EventInfo, globalDispatch?: boolean) => {
    return dispatcher.dispatch(eventInfo, globalDispatch);
  }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}

/** Stop propagation for an `EventInfo`. */
export function stopPropagation(eventInfoWrapper: EventInfoWrapper) {
  if (
    eventLib.isGecko &&
    (eventInfoWrapper.getTargetElement().tagName === 'INPUT' ||
      eventInfoWrapper.getTargetElement().tagName === 'TEXTAREA') &&
    eventInfoWrapper.getEventType() === EventType.FOCUS
  ) {
    /**
     * Do nothing since stopping propagation on a focus event on an input
     * element in Firefox makes the text cursor disappear:
     * https://bugzilla.mozilla.org/show_bug.cgi?id=509684
     */
    return;
  }

  const event = eventInfoWrapper.getEvent();
  // There are some cases where users of the `Dispatcher` will call dispatch
  // with a fake event that does not support `stopPropagation`.
  if (!event.stopPropagation) {
    return;
  }
  event.stopPropagation();
}
