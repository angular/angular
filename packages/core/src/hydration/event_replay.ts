/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  isSupportedEvent,
  isCaptureEvent,
  EventContractContainer,
  EventContract,
  EventDispatcher,
  registerDispatcher,
  EarlyJsactionDataContainer,
} from '@angular/core/primitives/event-dispatch';

import {APP_BOOTSTRAP_LISTENER, ApplicationRef, whenStable} from '../application/application_ref';
import {ENVIRONMENT_INITIALIZER, Injector} from '../di';
import {inject} from '../di/injector_compatibility';
import {Provider} from '../di/interface/provider';
import {setStashFn} from '../render3/instructions/listener';
import {RElement} from '../render3/interfaces/renderer_dom';
import {CLEANUP, LView, TView} from '../render3/interfaces/view';
import {isPlatformBrowser} from '../render3/util/misc_utils';
import {unwrapRNode} from '../render3/util/view_utils';

import {IS_EVENT_REPLAY_ENABLED, IS_GLOBAL_EVENT_DELEGATION_ENABLED} from './tokens';
import {
  GlobalEventDelegation,
  sharedStashFunction,
  removeListeners,
  invokeRegisteredListeners,
} from '../event_delegation_utils';
import {APP_ID} from '../application/application_tokens';

declare global {
  var ngContracts: {[key: string]: EarlyJsactionDataContainer};
}

export const CONTRACT_PROPERTY = 'ngContracts';

/**
 * A set of DOM elements with `jsaction` attributes.
 */
const jsactionSet = new Set<Element>();

function isGlobalEventDelegationEnabled(injector: Injector) {
  return injector.get(IS_GLOBAL_EVENT_DELEGATION_ENABLED, false);
}

/**
 * Returns a set of providers required to setup support for event replay.
 * Requires hydration to be enabled separately.
 */
export function withEventReplay(): Provider[] {
  return [
    {
      provide: IS_EVENT_REPLAY_ENABLED,
      useValue: true,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        const injector = inject(Injector);
        if (isGlobalEventDelegationEnabled(injector)) {
          return;
        }
        setStashFn((rEl: RElement, eventName: string, listenerFn: VoidFunction) => {
          sharedStashFunction(rEl, eventName, listenerFn);
          jsactionSet.add(rEl as unknown as Element);
        });
      },
      multi: true,
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        if (isPlatformBrowser()) {
          const injector = inject(Injector);
          const appRef = inject(ApplicationRef);
          return () => {
            // Kick off event replay logic once hydration for the initial part
            // of the application is completed. This timing is similar to the unclaimed
            // dehydrated views cleanup timing.
            whenStable(appRef).then(() => {
              if (isGlobalEventDelegationEnabled(injector)) {
                return;
              }
              const globalEventDelegation = injector.get(GlobalEventDelegation);
              initEventReplay(globalEventDelegation, injector);
              jsactionSet.forEach(removeListeners);
              // After hydration, we shouldn't need to do anymore work related to
              // event replay anymore.
              setStashFn(() => {});
            });
          };
        }
        return () => {}; // noop for the server code
      },
      multi: true,
    },
  ];
}

// TODO: Upstream this back into event-dispatch.
function getJsactionData(container: EarlyJsactionDataContainer) {
  return container._ejsa;
}

const initEventReplay = (eventDelegation: GlobalEventDelegation, injector: Injector) => {
  const appId = injector.get(APP_ID);
  // This is set in packages/platform-server/src/utils.ts
  // Note: globalThis[CONTRACT_PROPERTY] may be undefined in case Event Replay feature
  // is enabled, but there are no events configured in an application.
  const container = globalThis[CONTRACT_PROPERTY]?.[appId];
  const earlyJsactionData = getJsactionData(container)!;
  const eventContract = (eventDelegation.eventContract = new EventContract(
    new EventContractContainer(earlyJsactionData.c),
  ));
  for (const et of earlyJsactionData.et) {
    eventContract.addEvent(et);
  }
  for (const et of earlyJsactionData.etc) {
    eventContract.addEvent(et);
  }
  eventContract.replayEarlyEvents(container);
  const dispatcher = new EventDispatcher(invokeRegisteredListeners);
  registerDispatcher(eventContract, dispatcher);
};

/**
 * Extracts information about all DOM events (added in a template) registered on elements in a give
 * LView. Maps collected events to a corresponding DOM element (an element is used as a key).
 */
export function collectDomEventsInfo(
  tView: TView,
  lView: LView,
  eventTypesToReplay: {regular: Set<string>; capture: Set<string>},
): Map<Element, string[]> {
  const events = new Map<Element, string[]>();
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  if (!tCleanup || !lCleanup) {
    return events;
  }
  for (let i = 0; i < tCleanup.length; ) {
    const firstParam = tCleanup[i++];
    const secondParam = tCleanup[i++];
    if (typeof firstParam !== 'string') {
      continue;
    }
    const name: string = firstParam;
    if (!isSupportedEvent(name)) {
      continue;
    }
    if (isCaptureEvent(name)) {
      eventTypesToReplay.capture.add(name);
    } else {
      eventTypesToReplay.regular.add(name);
    }
    const listenerElement = unwrapRNode(lView[secondParam]) as any as Element;
    i++; // move the cursor to the next position (location of the listener idx)
    const useCaptureOrIndx = tCleanup[i++];
    // if useCaptureOrIndx is boolean then report it as is.
    // if useCaptureOrIndx is positive number then it in unsubscribe method
    // if useCaptureOrIndx is negative number then it is a Subscription
    const isDomEvent = typeof useCaptureOrIndx === 'boolean' || useCaptureOrIndx >= 0;
    if (!isDomEvent) {
      continue;
    }
    if (!events.has(listenerElement)) {
      events.set(listenerElement, [name]);
    } else {
      events.get(listenerElement)!.push(name);
    }
  }
  return events;
}
