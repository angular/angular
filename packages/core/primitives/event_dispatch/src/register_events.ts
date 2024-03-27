/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { EventContract } from './eventcontract';

declare global {
    interface Window {
        '__ngEventContracts__': any;
    }
}

export function registerEvents(container: Element, appId: string, events: string[]) {
    const eventContract = new EventContract();
    if (!(globalThis as any).__ngEventContracts__) {
        (globalThis as any).__ngEventContracts__ = {};
    }
    (globalThis as any).__ngEventContracts__[appId] = eventContract;
    for (const ev of events) {
        eventContract.addEvent(ev);
    }
    return eventContract.addContainer(container);
}

export function cleanup() {
    (globalThis as any).__ngEventContracts__ = undefined;
}
