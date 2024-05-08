/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  isEarlyEventType,
  isCaptureEventType,
  EventContractContainer,
  EventContract,
  EventDispatcher,
  registerDispatcher,
  getAppScopedQueuedEventInfos,
  clearAppScopedEarlyEventContract,
  EventPhase,
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

import {
  EVENT_REPLAY_ENABLED_DEFAULT,
  IS_EVENT_REPLAY_ENABLED,
  IS_GLOBAL_EVENT_DELEGATION_ENABLED,
} from './tokens';
import {
  sharedStashFunction,
  sharedMapFunction,
  removeListeners,
  BLOCKNAME_ATTRIBUTE,
  EventContractDetails,
  JSACTION_EVENT_CONTRACT,
} from '../event_delegation_utils';
import {APP_ID} from '../application/application_tokens';
import {performanceMarkFeature} from '../util/performance';
import {hydrateFromBlockName} from './api';

/**
 * A map of DOM elements with `jsaction` attributes grouped by action names.
 */
let jsActionMap = new Map<string, Set<Element>>();

function isGlobalEventDelegationEnabled(injector: Injector) {
  return injector.get(IS_GLOBAL_EVENT_DELEGATION_ENABLED, false);
}

/**
 * Determines whether Event Replay feature should be activated on the client.
 */
function shouldEnableEventReplay(injector: Injector) {
  return (
    injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT) &&
    !isGlobalEventDelegationEnabled(injector)
  );
}

/**
 * Returns a set of providers required to setup support for event replay.
 * Requires hydration to be enabled separately.
 */
export function withEventReplay(): Provider[] {
  return [
    {
      provide: IS_EVENT_REPLAY_ENABLED,
      useFactory: () => {
        let isEnabled = true;
        if (isPlatformBrowser()) {
          // Note: globalThis[CONTRACT_PROPERTY] may be undefined in case Event Replay feature
          // is enabled, but there are no events configured in this application, in which case
          // we don't activate this feature, since there are no events to replay.
          const appId = inject(APP_ID);
          isEnabled = !!window._ejsas?.[appId];
        }
        if (isEnabled) {
          performanceMarkFeature('NgEventReplay');
        }
        return isEnabled;
      },
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        const injector = inject(Injector);
        // TODO: is this a problem?
        if (isPlatformBrowser(injector) && shouldEnableEventReplay(injector)) {
          setStashFn((rEl: RElement, eventName: string, listenerFn: VoidFunction) => {
            sharedStashFunction(rEl, eventName, listenerFn);
            sharedMapFunction(rEl, jsActionMap);
          });
        }
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
            if (!shouldEnableEventReplay(injector)) {
              return;
            }

            // Kick off event replay logic once hydration for the initial part
            // of the application is completed. This timing is similar to the unclaimed
            // dehydrated views cleanup timing.
            whenStable(appRef).then(() => {
              const eventContractDetails = injector.get(JSACTION_EVENT_CONTRACT);
              initEventReplay(eventContractDetails, injector);
              removeListenersFromBlocks(['']);
              // After hydration, we shouldn't need to do anymore work related to
              // event replay anymore.
              // TODO: is this a problem for partial hydration?
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

const initEventReplay = (eventDelegation: EventContractDetails, injector: Injector) => {
  const appId = injector.get(APP_ID);
  const appRef = injector.get(ApplicationRef);
  // This is set in packages/platform-server/src/utils.ts
  const earlyJsactionData = window._ejsas![appId]!;
  const eventContract = (eventDelegation.instance = new EventContract(
    new EventContractContainer(earlyJsactionData.c),
  ));
  for (const et of earlyJsactionData.et) {
    eventContract.addEvent(et);
  }
  for (const et of earlyJsactionData.etc) {
    eventContract.addEvent(et);
  }
  const eventInfos = getAppScopedQueuedEventInfos(appId);
  eventContract.replayEarlyEventInfos(eventInfos);
  clearAppScopedEarlyEventContract(appId);
  const dispatcher = new EventDispatcher((event) => {
    invokeRegisteredReplayListeners(appRef, event);
  });
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
  const domEventsInfo = new Map<Element, string[]>();
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  if (!tCleanup || !lCleanup) {
    return domEventsInfo;
  }
  for (let i = 0; i < tCleanup.length; ) {
    const firstParam = tCleanup[i++];
    const secondParam = tCleanup[i++];
    if (typeof firstParam !== 'string') {
      continue;
    }
    const eventType = firstParam;
    if (!isEarlyEventType(eventType)) {
      continue;
    }
    if (isCaptureEventType(eventType)) {
      eventTypesToReplay.capture.add(eventType);
    } else {
      eventTypesToReplay.regular.add(eventType);
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
    if (!domEventsInfo.has(listenerElement)) {
      domEventsInfo.set(listenerElement, [eventType]);
    } else {
      domEventsInfo.get(listenerElement)!.push(eventType);
    }
  }
  return domEventsInfo;
}

export function invokeRegisteredReplayListeners(
  appRef: ApplicationRef,
  event: Event,
  hydratedBlocks?: Set<string>,
) {
  const el = (event.currentTarget as Element) || (event.target as Element);
  const blockName = (el && el.getAttribute(BLOCKNAME_ATTRIBUTE)) ?? '';
  if (
    event.eventPhase === EventPhase.REPLAY ||
    (blockName !== '' && hydratedBlocks && hydratedBlocks.has(blockName))
  ) {
    const handlerFns = el?.__jsaction_fns?.get(event.type);
    if (!handlerFns) {
      return;
    }
    for (const handler of handlerFns) {
      handler(event);
    }
    removeListenersFromBlocks(hydratedBlocks ? [...hydratedBlocks] : ['']);
  } else {
    if (/d\d+/.test(blockName)) {
      triggerBlockHydration(appRef, event, blockName);
    }
  }
}

async function triggerBlockHydration(appRef: ApplicationRef, event: Event, blockName: string) {
  const hydratedBlocks = await hydrateFromBlockName(appRef, blockName);
  hydratedBlocks.add(blockName);
  invokeRegisteredReplayListeners(appRef, event, hydratedBlocks);
}

function removeListenersFromBlocks(blockNames: string[]) {
  let blockList: Element[] = [];
  for (let blockName of blockNames) {
    blockList = [...blockList, ...jsActionMap.get(blockName)!];
  }
  const replayList = new Set(blockList);
  replayList.forEach(removeListeners);
}
