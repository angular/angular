/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActionResolver} from './action_resolver';
import {Dispatcher} from './dispatcher';
import {EventInfo, EventInfoWrapper} from './event_info';
import {UnrenamedEventContract} from './eventcontract';
import {Restriction} from './restriction';

/**
 * A replayer is a function that is called when there are queued events, from the `EventContract`.
 */
export type Replayer = (eventInfoWrappers: Event[]) => void;

/** An internal symbol used to indicate whether propagation should be stopped or not. */
export const PROPAGATION_STOPPED_SYMBOL = Symbol.for('propagationStopped');

/** Extra event phases beyond what the browser provides. */
export const eventPhase = {
  REPLAY: 101,
};

declare global {
  interface Event {
    [PROPAGATION_STOPPED_SYMBOL]?: boolean;
  }
}

/**
 * A dispatcher that uses browser-based `Event` semantics, for example bubbling, `stopPropagation`,
 * `currentTarget`, etc.
 */
export class EventDispatcher {
  private readonly actionResolver: ActionResolver;

  private readonly dispatcher: Dispatcher;

  constructor(private readonly dispatchDelegate: (event: Event, actionName: string) => void) {
    this.actionResolver = new ActionResolver();
    this.dispatcher = new Dispatcher(
      (eventInfoWrapper: EventInfoWrapper) => {
        this.dispatchToDelegate(eventInfoWrapper);
      },
      {
        actionResolver: this.actionResolver,
        eventReplayer: (eventInfoWrappers: EventInfoWrapper[]) => {
          for (const eventInfoWrapper of eventInfoWrappers) {
            prepareEventForReplay(eventInfoWrapper);
            this.dispatchToDelegate(eventInfoWrapper);
          }
        },
      },
    );
  }

  /**
   * The entrypoint for the `EventContract` dispatch.
   */
  dispatch(eventInfo: EventInfo): void {
    this.dispatcher.dispatch(eventInfo);
  }

  /** Internal method that does basic disaptching. */
  private dispatchToDelegate(eventInfoWrapper: EventInfoWrapper) {
    prepareEventForBubbling(eventInfoWrapper);
    while (eventInfoWrapper.getAction()) {
      prepareEventForDispatch(eventInfoWrapper);
      this.dispatchDelegate(eventInfoWrapper.getEvent(), eventInfoWrapper.getAction()!.name);
      if (propagationStopped(eventInfoWrapper)) {
        return;
      }
      this.actionResolver.resolveNextAction(eventInfoWrapper.eventInfo);
    }
  }
}

function prepareEventForBubbling(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const stopPropagation = () => {
    event[PROPAGATION_STOPPED_SYMBOL] = true;
  };
  Object.defineProperty(event, 'stopPropagation', {
    value: stopPropagation,
  });
  Object.defineProperty(event, 'stopImmediatePropagation', {
    value: stopPropagation,
  });
}

function propagationStopped(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  return !!event[PROPAGATION_STOPPED_SYMBOL];
}

function prepareEventForReplay(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const target = eventInfoWrapper.getTargetElement();
  Object.defineProperty(event, 'target', {
    value: target,
  });
  Object.defineProperty(event, 'eventPhase', {
    value: eventPhase.REPLAY,
  });
  Object.defineProperty(event, 'preventDefault', {
    value: () => {
      throw new Event(
        '`preventDefault` called during event replay. Because event replay occurs after browser ' +
          'dispatch, `preventDefault` would have no effect. You can check whether an event is ' +
          'being replayed by accessing the event phase: `event.eventPhase === eventPhase.REPLAY`.',
      );
    },
  });
  Object.defineProperty(event, 'composedPath', {
    value: () => {
      throw new Event(
        '`composedPath` called during event replay. Because event replay occurs after browser ' +
          'dispatch, `composedPath()` will be empty. Iterate parent nodes from `event.target` or ' +
          '`event.currentTarget` if you need to check elements in the event path.',
      );
    },
  });
}

function prepareEventForDispatch(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const currentTarget = eventInfoWrapper.getAction()?.element;
  if (currentTarget) {
    Object.defineProperty(event, 'currentTarget', {
      value: currentTarget,
      configurable: true, // `currentTarget` is going to get reassigned every dispatch.
    });
  }
}

/**
 * Registers deferred functionality for an EventContract and a Jsaction
 * Dispatcher.
 */
export function registerDispatcher(
  eventContract: UnrenamedEventContract,
  dispatcher: EventDispatcher,
) {
  eventContract.ecrd((eventInfo: EventInfo) => {
    dispatcher.dispatch(eventInfo);
  }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}
