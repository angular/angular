/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '../di/interface/provider';
import {TNode, TNodeType} from '../render3/interfaces/node';
import {RNode} from '../render3/interfaces/renderer_dom';
import {CLEANUP, LView, TView} from '../render3/interfaces/view';
import {unwrapRNode} from '../render3/util/view_utils';

import {IS_EVENT_REPLAY_ENABLED} from './tokens';

export const EVENT_REPLAY_ENABLED_DEFAULT = false;

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
  ];
}

/**
 * Extracts information about all DOM events (added in a template) registered on elements in a give
 * LView. Maps collected events to a corresponding DOM element (an element is used as a key).
 */
export function collectDomEventsInfo(
    tView: TView, lView: LView, eventTypesToReplay: Set<string>): Map<Element, string[]> {
  const events = new Map<Element, string[]>();
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  if (!tCleanup || !lCleanup) {
    return events;
  }
  for (let i = 0; i < tCleanup.length;) {
    const firstParam = tCleanup[i++];
    const secondParam = tCleanup[i++];
    if (typeof firstParam !== 'string') {
      continue;
    }
    const name: string = firstParam;
    eventTypesToReplay.add(name);
    const listenerElement = unwrapRNode(lView[secondParam]) as any as Element;
    i++;  // move the cursor to the next position (location of the listener idx)
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
    tNode: TNode, rNode: RNode, nativeElementToEvents: Map<Element, string[]>) {
  if (tNode.type & TNodeType.Element) {
    const nativeElement = unwrapRNode(rNode) as Element;
    const events = nativeElementToEvents.get(nativeElement) ?? [];
    const parts = events.map(event => `${event}:`);
    if (parts.length > 0) {
      nativeElement.setAttribute('jsaction', parts.join(';'));
    }
  }
}
