/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventInfo, EventInfoWrapper} from './event_info';
import {EventType} from './event_type';
import {Restriction} from './restriction';
import {UnrenamedEventContract} from './eventcontract';
import * as eventLib from './event';
import {ActionResolver} from './action_resolver';

/**
 * A replayer is a function that is called when there are queued events,
 * either from the `EventContract` or when there are no detected handlers.
 */
export type Replayer = (eventInfoWrappers: EventInfoWrapper[]) => void;

/**
 * Receives a DOM event, determines the jsaction associated with the source
 * element of the DOM event, and invokes the handler associated with the
 * jsaction.
 */
export class Dispatcher {
  // The ActionResolver to use to resolve actions.
  private actionResolver?: ActionResolver;

  /** The replayer function to be called when there are queued events. */
  private eventReplayer?: Replayer;

  /** Whether the event replay is scheduled. */
  private eventReplayScheduled = false;

  /** The queue of events. */
  private readonly replayEventInfoWrappers: EventInfoWrapper[] = [];

  /**
   * Options are:
   *   - `eventReplayer`: When the event contract dispatches replay events
   *      to the Dispatcher, the Dispatcher collects them and in the next tick
   *      dispatches them to the `eventReplayer`. Defaults to dispatching to `dispatchDelegate`.
   * @param dispatchDelegate A function that should handle dispatching an `EventInfoWrapper` to handlers.
   */
  constructor(
    private readonly dispatchDelegate: (eventInfoWrapper: EventInfoWrapper) => void,
    {
      actionResolver,
      eventReplayer,
    }: {actionResolver?: ActionResolver; eventReplayer?: Replayer} = {},
  ) {
    this.actionResolver = actionResolver;
    this.eventReplayer = eventReplayer;
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
  dispatch(eventInfo: EventInfo): void {
    const eventInfoWrapper = new EventInfoWrapper(eventInfo);
    this.actionResolver?.resolveEventType(eventInfo);
    this.actionResolver?.resolveAction(eventInfo);
    const action = eventInfoWrapper.getAction();
    if (action && shouldPreventDefaultBeforeDispatching(action.element, eventInfoWrapper)) {
      eventLib.preventDefault(eventInfoWrapper.getEvent());
    }
    if (this.eventReplayer && eventInfoWrapper.getIsReplay()) {
      this.scheduleEventInfoWrapperReplay(eventInfoWrapper);
      return;
    }
    this.dispatchDelegate(eventInfoWrapper);
  }

  /**
   * Schedules an `EventInfoWrapper` for replay. The replaying will happen in its own
   * stack once the current flow cedes control. This is done to mimic
   * browser event handling.
   */
  private scheduleEventInfoWrapperReplay(eventInfoWrapper: EventInfoWrapper) {
    this.replayEventInfoWrappers.push(eventInfoWrapper);
    if (this.eventReplayScheduled) {
      return;
    }
    this.eventReplayScheduled = true;
    Promise.resolve().then(() => {
      this.eventReplayScheduled = false;
      this.eventReplayer!(this.replayEventInfoWrappers);
    });
  }
}

/**
 * Creates an `EventReplayer` that calls the `replay` function for every `eventInfoWrapper` in
 * the queue.
 */
export function createEventReplayer(replay: (eventInfoWrapper: EventInfoWrapper) => void) {
  return (eventInfoWrappers: EventInfoWrapper[]) => {
    for (const eventInfoWrapper of eventInfoWrappers) {
      replay(eventInfoWrapper);
    }
  };
}

/**
 * Returns true if the default action of this event should be prevented before
 * this event is dispatched.
 */
function shouldPreventDefaultBeforeDispatching(
  actionElement: Element,
  eventInfoWrapper: EventInfoWrapper,
): boolean {
  // Prevent browser from following <a> node links if a jsaction is present
  // and we are dispatching the action now. Note that the targetElement may be
  // a child of an anchor that has a jsaction attached. For that reason, we
  // need to check the actionElement rather than the targetElement.
  return (
    actionElement.tagName === 'A' &&
    (eventInfoWrapper.getEventType() === EventType.CLICK ||
      eventInfoWrapper.getEventType() === EventType.CLICKMOD)
  );
}

/**
 * Registers deferred functionality for an EventContract and a Jsaction
 * Dispatcher.
 */
export function registerDispatcher(eventContract: UnrenamedEventContract, dispatcher: Dispatcher) {
  eventContract.ecrd((eventInfo: EventInfo) => {
    dispatcher.dispatch(eventInfo);
  }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}
