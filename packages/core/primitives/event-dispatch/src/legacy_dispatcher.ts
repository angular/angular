/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Dispatcher,
  EventInfoHandler as EventInfoWrapperHandler,
  GlobalHandler,
  stopPropagation,
} from './dispatcher';
import {Char} from './char';
import * as eventLib from './event';
import {EventInfo, EventInfoWrapper} from './event_info';
import {EventType} from './event_type';
import {UnrenamedEventContract} from './eventcontract';
import {Restriction} from './restriction';
import {ActionResolver} from './action_resolver';

/** Re-exports that should eventually be moved into this file. */
export type {
  EventInfoHandler,
  EventInfoHandler as EventInfoWrapperHandler,
  GlobalHandler,
} from './dispatcher';
export {stopPropagation} from './dispatcher';

/**
 * A replayer is a function that is called when there are queued events,
 * either from the `EventContract` or when there are no detected handlers.
 */
export type Replayer = (
  eventInfoWrappers: EventInfoWrapper[],
  dispatcher: LegacyDispatcher,
) => void;

/**
 * Receives a DOM event, determines the jsaction associated with the source
 * element of the DOM event, and invokes the handler associated with the
 * jsaction.
 */
export class LegacyDispatcher {
  private readonly dispatcher: Dispatcher;

  /** Whether to stop propagation for an `EventInfo`. */
  private readonly stopPropagation: boolean;

  /**
   * The actions that are registered for this Dispatcher instance.
   * This should be the primary one used once migration off of registerHandlers
   * is done.
   */
  private readonly actions: {[key: string]: EventInfoWrapperHandler} = {};

  /** A map of global event handlers, where each key is an event type. */
  private readonly globalHandlers = new Map<string, Set<GlobalHandler>>();

  /** The event replayer. */
  private eventReplayer?: Replayer;

  /** The event infos that have be replayed. */
  private eventInfoWrapperQueue?: EventInfoWrapper[];

  /** Whether event replay is scheduled. */
  private eventReplayScheduled: boolean = false;

  /**
   * Receives a DOM event, determines the jsaction associated with the source
   * element of the DOM event, and invokes the handler associated with the
   * jsaction.
   *
   * @param getHandler A function that knows how to get the handler for a
   *     given event info.
   */
  constructor(
    private readonly getHandler?: (
      eventInfoWrapper: EventInfoWrapper,
    ) => EventInfoWrapperHandler | void,
    {
      actionResolver,
      eventReplayer,
      stopPropagation = false,
    }: {actionResolver?: ActionResolver; eventReplayer?: Replayer; stopPropagation?: boolean} = {},
  ) {
    this.eventReplayer = eventReplayer;
    this.dispatcher = new Dispatcher(
      (eventInfoWrapper: EventInfoWrapper) => {
        this.dispatchToHandler(eventInfoWrapper);
      },
      {
        actionResolver,
        eventReplayer: (eventInfoWrappers) => {
          this.eventInfoWrapperQueue = eventInfoWrappers;
          this.eventReplayer?.(this.eventInfoWrapperQueue, this);
        },
      },
    );
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
   */
  dispatch(eventInfo: EventInfo, isGlobalDispatch?: boolean): void {
    this.dispatcher.dispatch(eventInfo);
  }

  /**
   * Dispatches an `EventInfoWrapper`.
   */
  private dispatchToHandler(eventInfoWrapper: EventInfoWrapper) {
    if (this.globalHandlers.size) {
      const globalEventInfoWrapper = eventInfoWrapper.clone();

      // In some cases, `populateAction` will rewrite `click` events to
      // `clickonly`. Revert back to a regular click, otherwise we won't be able
      // to execute global event handlers registered on click events.
      if (globalEventInfoWrapper.getEventType() === EventType.CLICKONLY) {
        globalEventInfoWrapper.setEventType(EventType.CLICK);
      }
      // Skip everything related to jsaction handlers, and execute the global
      // handlers.
      const event = globalEventInfoWrapper.getEvent();
      const eventTypeHandlers = this.globalHandlers.get(globalEventInfoWrapper.getEventType());
      let shouldPreventDefault = false;
      if (eventTypeHandlers) {
        for (const handler of eventTypeHandlers) {
          if (handler(event) === false) {
            shouldPreventDefault = true;
          }
        }
      }
      if (shouldPreventDefault) {
        eventLib.preventDefault(event);
      }
    }

    const action = eventInfoWrapper.getAction();
    if (!action) {
      return;
    }

    if (this.stopPropagation) {
      stopPropagation(eventInfoWrapper);
    }

    let handler: EventInfoWrapperHandler | void = undefined;
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
    this.eventInfoWrapperQueue?.push(eventInfoWrapper);
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
    methods: {[key: string]: EventInfoWrapperHandler},
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
    if (!this.globalHandlers.has(eventType)) {
      this.globalHandlers.set(eventType, new Set<GlobalHandler>([handler]));
    } else {
      this.globalHandlers.get(eventType)!.add(handler);
    }
  }

  /** Unregisters a global event handler. */
  unregisterGlobalHandler(eventType: string, handler: GlobalHandler) {
    if (this.globalHandlers.has(eventType)) {
      this.globalHandlers.get(eventType)!.delete(handler);
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

  /**
   * Replays queued events, if any. The replaying will happen in its own
   * stack once the current flow cedes control. This is done to mimic
   * browser event handling.
   */
  private scheduleEventReplay() {
    if (this.eventReplayScheduled || !this.eventReplayer || !this.eventInfoWrapperQueue?.length) {
      return;
    }
    this.eventReplayScheduled = true;
    Promise.resolve().then(() => {
      this.eventReplayScheduled = false;
      this.eventReplayer!(this.eventInfoWrapperQueue!, this);
    });
  }
}

/**
 * Registers deferred functionality for an EventContract and a Jsaction
 * Dispatcher.
 */
export function registerDispatcher(
  eventContract: UnrenamedEventContract,
  dispatcher: LegacyDispatcher,
) {
  eventContract.ecrd((eventInfo: EventInfo) => {
    dispatcher.dispatch(eventInfo);
  }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}
