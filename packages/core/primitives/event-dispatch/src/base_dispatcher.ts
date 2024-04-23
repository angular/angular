/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventInfo, EventInfoWrapper} from './event_info';
import {UnrenamedEventContract} from './eventcontract';
import {Restriction} from './restriction';
/**
 * A replayer is a function that is called when there are queued events,
 * either from the `EventContract` or when there are no detected handlers.
 */
export type Replayer = (eventInfoWrappers: EventInfoWrapper[]) => void;
/**
 * A handler is dispatched to during normal handling.
 */
export type EventInfoWrapperHandler = (eventInfoWrapper: EventInfoWrapper) => void;
/**
 * Receives a DOM event, determines the jsaction associated with the source
 * element of the DOM event, and invokes the handler associated with the
 * jsaction.
 */
export class BaseDispatcher {
  /** The queue of events. */
  private readonly queuedEventInfoWrappers: EventInfoWrapper[] = [];
  /** The replayer function to be called when there are queued events. */
  private eventReplayer?: Replayer;
  /** Whether the event replay is scheduled. */
  private eventReplayScheduled = false;

  /**
   * Options are:
   *   1. `eventReplayer`: When the event contract dispatches replay events
   *      to the Dispatcher, the Dispatcher collects them and in the next tick
   *      dispatches them to the `eventReplayer`.
   * @param dispatchDelegate A function that should handle dispatching an `EventInfoWrapper` to handlers.
   */
  constructor(
    private readonly dispatchDelegate: (
      eventInfoWrapper: EventInfoWrapper,
      isGlobalDispatch?: boolean,
    ) => void,
    {eventReplayer = undefined}: {eventReplayer?: Replayer} = {},
  ) {
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
   * @param isGlobalDispatch If true, dispatches a global event instead of a
   *     regular jsaction handler.
   */
  dispatch(eventInfo: EventInfo, isGlobalDispatch?: boolean): void {
    const eventInfoWrapper = new EventInfoWrapper(eventInfo);
    if (eventInfoWrapper.getIsReplay()) {
      if (isGlobalDispatch || !this.eventReplayer) {
        return;
      }
      this.queueEventInfoWrapper(eventInfoWrapper);
      this.scheduleEventReplay();
      return;
    }
    this.dispatchDelegate(eventInfoWrapper, isGlobalDispatch);
  }

  /** Queue an `EventInfoWrapper` for replay. */
  queueEventInfoWrapper(eventInfoWrapper: EventInfoWrapper) {
    this.queuedEventInfoWrappers.push(eventInfoWrapper);
  }

  /**
   * Replays queued events, if any. The replaying will happen in its own
   * stack once the current flow cedes control. This is done to mimic
   * browser event handling.
   */
  scheduleEventReplay() {
    if (
      this.eventReplayScheduled ||
      !this.eventReplayer ||
      this.queuedEventInfoWrappers.length === 0
    ) {
      return;
    }
    this.eventReplayScheduled = true;
    Promise.resolve().then(() => {
      this.eventReplayScheduled = false;
      this.eventReplayer!(this.queuedEventInfoWrappers);
    });
  }
}

/**
 * Registers deferred functionality for an EventContract and a Jsaction
 * Dispatcher.
 */
export function registerDispatcher(
  eventContract: UnrenamedEventContract,
  dispatcher: BaseDispatcher,
) {
  eventContract.ecrd((eventInfo: EventInfo, globalDispatch?: boolean) => {
    dispatcher.dispatch(eventInfo, globalDispatch);
  }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}
