/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ActionResolver} from './action_resolver';
import {Dispatcher} from './dispatcher';
import {EventInfo, EventInfoWrapper} from './event_info';
import {isCaptureEventType} from './event_type';
import {UnrenamedEventContract} from './eventcontract';
import {Restriction} from './restriction';

// Necessary to make the `ngDevMode` global types available.
import '../../../src/util/ng_dev_mode';

/**
 * A replayer is a function that is called when there are queued events, from the `EventContract`.
 */
export type Replayer = (eventInfoWrappers: Event[]) => void;

/** An internal symbol used to indicate whether propagation should be stopped or not. */
export const PROPAGATION_STOPPED_SYMBOL: unique symbol =
  /* @__PURE__ */ Symbol.for('propagationStopped');

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

  constructor(
    private readonly dispatchDelegate: (event: Event, actionName: string) => void,
    private readonly clickModSupport = true,
  ) {
    this.actionResolver = new ActionResolver({clickModSupport});
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
    if (eventInfoWrapper.getIsReplay()) {
      prepareEventForReplay(eventInfoWrapper);
    }
    prepareEventForBubbling(eventInfoWrapper);
    while (eventInfoWrapper.getAction()) {
      prepareEventForDispatch(eventInfoWrapper);
      // If this is a capture event, ONLY dispatch if the action element is the target.
      if (
        isCaptureEventType(eventInfoWrapper.getEventType()) &&
        eventInfoWrapper.getAction()!.element !== eventInfoWrapper.getTargetElement()
      ) {
        return;
      }
      this.dispatchDelegate(eventInfoWrapper.getEvent(), eventInfoWrapper.getAction()!.name);
      if (propagationStopped(eventInfoWrapper)) {
        return;
      }
      this.actionResolver.resolveParentAction(eventInfoWrapper.eventInfo);
    }
  }
}

function prepareEventForBubbling(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const originalStopPropagation = eventInfoWrapper.getEvent().stopPropagation.bind(event);
  const stopPropagation = () => {
    event[PROPAGATION_STOPPED_SYMBOL] = true;
    originalStopPropagation();
  };
  patchEventInstance(event, 'stopPropagation', stopPropagation);
  patchEventInstance(event, 'stopImmediatePropagation', stopPropagation);
}

function propagationStopped(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  return !!event[PROPAGATION_STOPPED_SYMBOL];
}

function prepareEventForReplay(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const target = eventInfoWrapper.getTargetElement();
  const originalPreventDefault = event.preventDefault.bind(event);
  patchEventInstance(event, 'target', target);
  patchEventInstance(event, 'eventPhase', EventPhase.REPLAY);
  patchEventInstance(event, 'preventDefault', () => {
    originalPreventDefault();
    throw new Error(
      PREVENT_DEFAULT_ERROR_MESSAGE + (ngDevMode ? PREVENT_DEFAULT_ERROR_MESSAGE_DETAILS : ''),
    );
  });
  patchEventInstance(event, 'composedPath', () => {
    throw new Error(
      COMPOSED_PATH_ERROR_MESSAGE + (ngDevMode ? COMPOSED_PATH_ERROR_MESSAGE_DETAILS : ''),
    );
  });
}

function prepareEventForDispatch(eventInfoWrapper: EventInfoWrapper) {
  const event = eventInfoWrapper.getEvent();
  const currentTarget = eventInfoWrapper.getAction()?.element;
  if (currentTarget) {
    patchEventInstance(event, 'currentTarget', currentTarget, {
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
function patchEventInstance<T>(
  event: Event,
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
