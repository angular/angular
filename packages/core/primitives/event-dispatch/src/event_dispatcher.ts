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

/** Extra event phases beyond what the browser provides. */
export const EventPhase = {
  REPLAY: 101,
};

const PREVENT_DEFAULT_ERROR_MESSAGE_DETAILS =
  ' Because event replay occurs after browser dispatch, `preventDefault` would have no ' +
  'effect. You can check whether an event is being replayed by accessing the event phase: ' +
  '`event.eventPhase === EventPhase.REPLAY`.';
const PREVENT_DEFAULT_ERROR_MESSAGE = `\`preventDefault\` called during event replay.`;
const COMPOSED_PATH_ERROR_MESSAGE_DETAILS =
  ' Because event replay occurs after browser ' +
  'dispatch, `composedPath()` will be empty. Iterate parent nodes from `event.target` or ' +
  '`event.currentTarget` if you need to check elements in the event path.';
const COMPOSED_PATH_ERROR_MESSAGE = `\`composedPath\` called during event replay.`;

export interface SyntheticEvent extends Event {
  propagationStopped?: boolean;
  originalEvent: Event;
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
    const event = eventInfoWrapper.getEvent();
    // Create a synthetic event that uses the original event as its prototype, via `Object.create`.
    const syntheticEvent: SyntheticEvent = Object.create(event, {originalEvent: {value: event}});
    if (eventInfoWrapper.getIsReplay()) {
      prepareEventForReplay(syntheticEvent, eventInfoWrapper.getTargetElement());
    }
    prepareEventForBubbling(syntheticEvent);
    let action = eventInfoWrapper.getAction();
    while (action) {
      prepareEventForDelegation(syntheticEvent, action.element);
      this.dispatchDelegate(syntheticEvent, action.name);
      if (propagationStopped(syntheticEvent)) {
        return;
      }
      this.actionResolver.resolveParentAction(eventInfoWrapper.eventInfo);
      action = eventInfoWrapper.getAction();
    }
  }
}

/**
 * Prepare the `SyntheticEvent` for bubbling by providing a polyfill implementation of
 * `stopPropagation` and `stopImmediatePropagation`.
 */
function prepareEventForBubbling(syntheticEvent: SyntheticEvent) {
  const stopPropagation = () => {
    syntheticEvent.propagationStopped = true;
  };
  patchSyntheticEvent(syntheticEvent, 'stopPropagation', stopPropagation);
  patchSyntheticEvent(syntheticEvent, 'stopImmediatePropagation', stopPropagation);
}

/**
 * Checks the synthetic `propagationStopped` property. The `SyntheticEvent` must have been pass
 * to `prepareEventForBubbling` for this property to have been set.
 */
function propagationStopped(syntheticEvent: SyntheticEvent) {
  return !!syntheticEvent.propagationStopped;
}

/**
 * Prepare the `SyntheticEvent` for replay by populating various properties:
 *   - `target`: Copies the target property, as the underlying `Event` may clear it.
 *   - `eventPhase`: Set the event phase to `REPLAY`.
 *   - `preventDefault`: Throw an error indicating that `preventDefault` does nothing during replay.
 *   - `composedPath`: Throw an error indicating that `composedPath` will be empty during replay.
 */
function prepareEventForReplay(syntheticEvent: SyntheticEvent, target: Element) {
  patchSyntheticEvent(syntheticEvent, 'target', target);
  patchSyntheticEvent(syntheticEvent, 'eventPhase', EventPhase.REPLAY);
  patchSyntheticEvent(syntheticEvent, 'preventDefault', () => {
    throw new Error(
      PREVENT_DEFAULT_ERROR_MESSAGE + (ngDevMode ? PREVENT_DEFAULT_ERROR_MESSAGE_DETAILS : ''),
    );
  });
  patchSyntheticEvent(syntheticEvent, 'composedPath', () => {
    throw new Error(
      COMPOSED_PATH_ERROR_MESSAGE + (ngDevMode ? COMPOSED_PATH_ERROR_MESSAGE_DETAILS : ''),
    );
  });
}

/**
 * Prepare the `SyntheticEvent` for dispatch by populating the `currentTarget` property, which may
 * not match the actual `currentTarget` property.
 */
function prepareEventForDelegation(syntheticEvent: SyntheticEvent, currentTarget: Element) {
  if (currentTarget) {
    patchSyntheticEvent(syntheticEvent, 'currentTarget', currentTarget, {
      // `currentTarget` is going to get reassigned every dispatch.
      configurable: true,
    });
  }
}

/**
 * Patch `Event` instance during non-standard `Event` dispatch. This patches just the `Event`
 * instance that the browser created, it does not patch global properties or methods.
 *
 * This is necessary because dispatching an `Event` outside of browser dispatch results in
 * incorrect properties and methods that need to be polyfilled or do not work.
 *
 * JSAction dispatch adds two extra "phases" to event dispatch:
 * 1. Event delegation - the event is being dispatched by a delegating event handler on a container
 *    (typically `window.document.documentElement`), to a delegated event handler on some child
 *    element. Certain `Event` properties will be unintuitive, such as `currentTarget`, which would
 *    be the container rather than the child element. Bubbling would also not work. In order to
 *    emulate the browser, these properties and methods on the `Event` are patched.
 * 2. Event replay - the event is being dispatched by the framework once the handlers have been
 *    loaded (during hydration, or late-loaded). Certain `Event` properties can be unset by the
 *    browser because the `Event` is no longer actively being dispatched, such as `target`. Other
 *    methods have no effect because the `Event` has already been dispatched, such as
 *    `preventDefault`. Bubbling would also not work. These properties and methods are patched,
 *    either to fill in information that the browser may have removed, or to throw errors in methods
 *    that no longer behave as expected.
 */
function patchSyntheticEvent<T>(
  event: SyntheticEvent,
  property: string,
  value: T,
  {configurable = false}: {configurable?: boolean} = {},
) {
  Object.defineProperty(event, property, {value, configurable});
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
