/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
} from '../../primitives/event-dispatch';

import {APP_BOOTSTRAP_LISTENER, ApplicationRef} from '../application/application_ref';
import {ENVIRONMENT_INITIALIZER, Injector} from '../di';
import {inject} from '../di/injector_compatibility';
import {Provider} from '../di/interface/provider';
import {RElement, RNode} from '../render3/interfaces/renderer_dom';
import {CLEANUP, LView, TView} from '../render3/interfaces/view';
import {unwrapRNode} from '../render3/util/view_utils';

import {
  JSACTION_BLOCK_ELEMENT_MAP,
  EVENT_REPLAY_ENABLED_DEFAULT,
  IS_EVENT_REPLAY_ENABLED,
} from './tokens';
import {
  sharedStashFunction,
  sharedMapFunction,
  DEFER_BLOCK_SSR_ID_ATTRIBUTE,
  EventContractDetails,
  JSACTION_EVENT_CONTRACT,
  invokeListeners,
  removeListeners,
  enableStashEventListenerImpl,
  setStashFn,
} from '../event_delegation_utils';
import {APP_ID} from '../application/application_tokens';
import {performanceMarkFeature} from '../util/performance';
import {triggerHydrationFromBlockName} from '../defer/triggering';
import {isIncrementalHydrationEnabled} from './utils';

/** Apps in which we've enabled event replay.
 *  This is to prevent initializing event replay more than once per app.
 */
const appsWithEventReplay = new WeakSet<ApplicationRef>();

/**
 * The key that represents all replayable elements that are not in defer blocks.
 */
const EAGER_CONTENT_LISTENERS_KEY = '';

/**
 * A list of block events that need to be replayed
 */
let blockEventQueue: {event: Event; currentTarget: Element}[] = [];

/**
 * Determines whether Event Replay feature should be activated on the client.
 */
function shouldEnableEventReplay(injector: Injector) {
  return injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT);
}

/**
 * Returns a set of providers required to setup support for event replay.
 * Requires hydration to be enabled separately.
 */
export function withEventReplay(): Provider[] {
  const providers: Provider[] = [
    {
      provide: IS_EVENT_REPLAY_ENABLED,
      useFactory: () => {
        let isEnabled = true;
        if (typeof ngServerMode === 'undefined' || !ngServerMode) {
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
  ];

  if (typeof ngServerMode === 'undefined' || !ngServerMode) {
    providers.push(
      {
        provide: ENVIRONMENT_INITIALIZER,
        useValue: () => {
          const appRef = inject(ApplicationRef);
          const {injector} = appRef;
          // We have to check for the appRef here due to the possibility of multiple apps
          // being present on the same page. We only want to enable event replay for the
          // apps that actually want it.
          if (!appsWithEventReplay.has(appRef)) {
            const jsActionMap = inject(JSACTION_BLOCK_ELEMENT_MAP);
            if (shouldEnableEventReplay(injector)) {
              enableStashEventListenerImpl();
              const appId = injector.get(APP_ID);
              const clearStashFn = setStashFn(
                appId,
                (rEl: RNode, eventName: string, listenerFn: VoidFunction) => {
                  // If a user binds to a ng-container and uses a directive that binds using a host listener,
                  // this element could be a comment node. So we need to ensure we have an actual element
                  // node before stashing anything.
                  if ((rEl as Node).nodeType !== Node.ELEMENT_NODE) return;
                  sharedStashFunction(rEl as RElement, eventName, listenerFn);
                  sharedMapFunction(rEl as RElement, jsActionMap);
                },
              );
              // Clean up the reference to the function set by the environment initializer,
              // as the function closure may capture injected elements and prevent them
              // from being properly garbage collected.
              appRef.onDestroy(clearStashFn);
            }
          }
        },
        multi: true,
      },
      {
        provide: APP_BOOTSTRAP_LISTENER,
        useFactory: () => {
          const appRef = inject(ApplicationRef);
          const {injector} = appRef;

          return () => {
            // We have to check for the appRef here due to the possibility of multiple apps
            // being present on the same page. We only want to enable event replay for the
            // apps that actually want it.
            if (!shouldEnableEventReplay(injector) || appsWithEventReplay.has(appRef)) {
              return;
            }

            appsWithEventReplay.add(appRef);

            const appId = injector.get(APP_ID);
            appRef.onDestroy(() => {
              appsWithEventReplay.delete(appRef);
              // Ensure that we're always safe calling this in the browser.
              if (typeof ngServerMode !== 'undefined' && !ngServerMode) {
                // `_ejsa` should be deleted when the app is destroyed, ensuring that
                // no elements are still captured in the global list and are not prevented
                // from being garbage collected.
                clearAppScopedEarlyEventContract(appId);
              }
            });

            // Kick off event replay logic once hydration for the initial part
            // of the application is completed. This timing is similar to the unclaimed
            // dehydrated views cleanup timing.
            appRef.whenStable().then(() => {
              // Note: we have to check whether the application is destroyed before
              // performing other operations with the `injector`.
              // The application may be destroyed **before** it becomes stable, so when
              // the `whenStable` resolves, the injector might already be in
              // a destroyed state. Thus, calling `injector.get` would throw an error
              // indicating that the injector has already been destroyed.
              if (appRef.destroyed) {
                return;
              }

              const eventContractDetails = injector.get(JSACTION_EVENT_CONTRACT);
              initEventReplay(eventContractDetails, injector);
              const jsActionMap = injector.get(JSACTION_BLOCK_ELEMENT_MAP);
              jsActionMap.get(EAGER_CONTENT_LISTENERS_KEY)?.forEach(removeListeners);
              jsActionMap.delete(EAGER_CONTENT_LISTENERS_KEY);

              const eventContract = eventContractDetails.instance!;
              // This removes event listeners registered through the container manager,
              // as listeners registered on `document.body` might never be removed if we
              // don't clean up the contract.
              if (isIncrementalHydrationEnabled(injector)) {
                // When incremental hydration is enabled, we cannot clean up the event
                // contract immediately because we're unaware if there are any deferred
                // blocks to hydrate. We can only schedule a contract cleanup when the
                // app is destroyed.
                appRef.onDestroy(() => eventContract.cleanUp());
              } else {
                eventContract.cleanUp();
              }
            });
          };
        },
        multi: true,
      },
    );
  }

  return providers;
}

const initEventReplay = (eventDelegation: EventContractDetails, injector: Injector) => {
  const appId = injector.get(APP_ID);
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
    invokeRegisteredReplayListeners(injector, event, event.currentTarget as Element);
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
  injector: Injector,
  event: Event,
  currentTarget: Element | null,
) {
  const blockName =
    (currentTarget && currentTarget.getAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE)) ?? '';
  if (/d\d+/.test(blockName)) {
    hydrateAndInvokeBlockListeners(blockName, injector, event, currentTarget!);
  } else if (event.eventPhase === EventPhase.REPLAY) {
    invokeListeners(event, currentTarget);
  }
}

function hydrateAndInvokeBlockListeners(
  blockName: string,
  injector: Injector,
  event: Event,
  currentTarget: Element,
) {
  blockEventQueue.push({event, currentTarget});
  triggerHydrationFromBlockName(injector, blockName, replayQueuedBlockEvents);
}

function replayQueuedBlockEvents(hydratedBlocks: string[]) {
  // clone the queue
  const queue = [...blockEventQueue];
  const hydrated = new Set<string>(hydratedBlocks);
  // empty it
  blockEventQueue = [];
  for (let {event, currentTarget} of queue) {
    const blockName = currentTarget.getAttribute(DEFER_BLOCK_SSR_ID_ATTRIBUTE)!;
    if (hydrated.has(blockName)) {
      invokeListeners(event, currentTarget);
    } else {
      // requeue events that weren't yet hydrated
      blockEventQueue.push({event, currentTarget});
    }
  }
}
