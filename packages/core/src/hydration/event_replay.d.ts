/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di';
import { Provider } from '../di/interface/provider';
import { LView, TView } from '../render3/interfaces/view';
/**
 * Returns a set of providers required to setup support for event replay.
 * Requires hydration to be enabled separately.
 */
export declare function withEventReplay(): Provider[];
/**
 * Extracts information about all DOM events (added in a template) registered on elements in a give
 * LView. Maps collected events to a corresponding DOM element (an element is used as a key).
 */
export declare function collectDomEventsInfo(tView: TView, lView: LView, eventTypesToReplay: {
    regular: Set<string>;
    capture: Set<string>;
}): Map<Element, string[]>;
export declare function invokeRegisteredReplayListeners(injector: Injector, event: Event, currentTarget: Element | null): void;
