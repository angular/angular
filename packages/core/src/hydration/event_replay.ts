/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BaseDispatcher,
  EarlyJsactionDataContainer,
  EventContract,
  EventContractContainer,
  EventInfoWrapper,
  registerDispatcher,
} from '@angular/core/primitives/event-dispatch';

import {APP_BOOTSTRAP_LISTENER, ApplicationRef, whenStable} from '../application/application_ref';
import {APP_ID} from '../application/application_tokens';
import {ENVIRONMENT_INITIALIZER, Injector} from '../di';
import {inject} from '../di/injector_compatibility';
import {Provider} from '../di/interface/provider';
import {attachLViewId, readLView} from '../render3/context_discovery';
import {setDisableEventReplayImpl} from '../render3/instructions/listener';
import {TNode, TNodeType} from '../render3/interfaces/node';
import {RElement, RNode} from '../render3/interfaces/renderer_dom';
import {CLEANUP, LView, TVIEW, TView} from '../render3/interfaces/view';
import {isPlatformBrowser} from '../render3/util/misc_utils';
import {unwrapRNode} from '../render3/util/view_utils';

import {IS_EVENT_REPLAY_ENABLED} from './tokens';

export const EVENT_REPLAY_ENABLED_DEFAULT = false;
export const CONTRACT_PROPERTY = 'ngContracts';

declare global {
  var ngContracts: {[key: string]: EarlyJsactionDataContainer};
}

// TODO: Upstream this back into event-dispatch.
function getJsactionData(container: EarlyJsactionDataContainer) {
  return container._ejsa;
}

const JSACTION_ATTRIBUTE = 'jsaction';
const removeJsactionQueue: RElement[] = [];

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
        setDisableEventReplayImpl((el: RElement) => {
          if (el.hasAttribute(JSACTION_ATTRIBUTE)) {
            // We don't immediately remove the attribute here because
            // we need it for replay that happens after hydration.
            removeJsactionQueue.push(el);
          }
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
              const appId = injector.get(APP_ID);
              // This is set in packages/platform-server/src/utils.ts
              // Note: globalThis[CONTRACT_PROPERTY] may be undefined in case Event Replay feature
              // is enabled, but there are no events configured in an application.
              const container = globalThis[CONTRACT_PROPERTY]?.[appId];
              const earlyJsactionData = getJsactionData(container);
              if (earlyJsactionData) {
                const eventContract = new EventContract(
                  new EventContractContainer(earlyJsactionData.c),
                );
                for (const et of earlyJsactionData.et) {
                  eventContract.addEvent(et);
                }
                for (const et of earlyJsactionData.etc) {
                  eventContract.addEvent(et);
                }
                eventContract.replayEarlyEvents(container);
                const dispatcher = new BaseDispatcher(() => {}, {
                  eventReplayer: (queue) => {
                    for (const event of queue) {
                      handleEvent(event);
                    }
                    queue.length = 0;
                  },
                });
                registerDispatcher(eventContract, dispatcher);
                for (const el of removeJsactionQueue) {
                  el.removeAttribute(JSACTION_ATTRIBUTE);
                }
                removeJsactionQueue.length = 0;
              }
            });
          };
        }
        return () => {}; // noop for the server code
      },
      multi: true,
    },
  ];
}

/**
 * Extracts information about all DOM events (added in a template) registered on elements in a give
 * LView. Maps collected events to a corresponding DOM element (an element is used as a key).
 */
export function collectDomEventsInfo(
  tView: TView,
  lView: LView,
  eventTypesToReplay: Set<string>,
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
    eventTypesToReplay.add(name);
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

export function setJSActionAttribute(
  tNode: TNode,
  rNode: RNode,
  nativeElementToEvents: Map<Element, string[]>,
) {
  if (tNode.type & TNodeType.Element) {
    const nativeElement = unwrapRNode(rNode) as Element;
    const events = nativeElementToEvents.get(nativeElement) ?? [];
    const parts = events.map((event) => `${event}:`);
    if (parts.length > 0) {
      nativeElement.setAttribute(JSACTION_ATTRIBUTE, parts.join(';'));
    }
  }
}

/**
 * Finds an LView that a given DOM element belongs to.
 */
function getLViewByElement(target: HTMLElement): LView | null {
  let lView = readLView(target);
  if (lView) {
    return lView;
  } else {
    // If this node doesn't have LView info attached, then we need to
    // traverse upwards up the DOM to find the nearest element that
    // has already been monkey patched with data.
    let parent = target as HTMLElement;
    while ((parent = parent.parentNode as HTMLElement)) {
      lView = readLView(parent);
      if (lView) {
        // To prevent additional lookups, monkey-patch LView id onto this DOM node.
        // TODO: consider patching all parent nodes that didn't have LView id, so that
        // we can avoid lookups for more nodes.
        attachLViewId(target, lView);
        return lView;
      }
    }
  }
  return null;
}

function handleEvent(event: EventInfoWrapper) {
  const nativeElement = event.getAction()!.element;
  // Dispatch event via Angular's logic
  if (nativeElement) {
    const lView = getLViewByElement(nativeElement as HTMLElement);
    if (lView !== null) {
      const tView = lView[TVIEW];
      const eventName = event.getEventType();
      const origEvent = event.getEvent();
      const listeners = getEventListeners(tView, lView, nativeElement, eventName);
      for (const listener of listeners) {
        listener(origEvent);
      }
    }
  }
}

type Listener = ((value: Event) => unknown) | (() => unknown);

function getEventListeners(
  tView: TView,
  lView: LView,
  nativeElement: Element,
  eventName: string,
): Listener[] {
  const listeners: Listener[] = [];
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  if (tCleanup && lCleanup) {
    for (let i = 0; i < tCleanup.length; ) {
      const storedEventName = tCleanup[i++];
      const nativeElementIndex = tCleanup[i++];
      if (typeof storedEventName === 'string') {
        const listenerElement = unwrapRNode(lView[nativeElementIndex]) as any as Element;
        const listener: Listener = lCleanup[tCleanup[i++]];
        i++; // increment to the next position;
        if (listenerElement === nativeElement && eventName === storedEventName) {
          listeners.push(listener);
        }
      }
    }
  }
  return listeners;
}
