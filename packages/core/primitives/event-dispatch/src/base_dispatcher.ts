/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute as AccessibilityAttribute} from './accessibility';
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
      this.queueEventInfoWrapper(eventInfoWrapper);
      this.scheduleEventReplay();
      return;
    }
    const resolved = resolveA11yEvent(eventInfoWrapper, isGlobalDispatch);
    if (!resolved) {
      // Reset action information.
      eventInfoWrapper.setAction(undefined);
      return eventInfoWrapper.eventInfo;
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
export function registerDispatcher(
  eventContract: UnrenamedEventContract,
  dispatcher: BaseDispatcher,
) {
  eventContract.ecrd((eventInfo: EventInfo, globalDispatch?: boolean) => {
    return dispatcher.dispatch(eventInfo, globalDispatch);
  }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}
