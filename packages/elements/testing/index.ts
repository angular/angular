/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {scheduler} from '../src/utils';

export interface MockScheduler {
  schedule: (typeof scheduler)['schedule'];
  scheduleBeforeRender: (typeof scheduler)['scheduleBeforeRender'];
}

export class AsyncMockScheduler implements MockScheduler {
  private uid = 0;
  private pendingBeforeRenderCallbacks: ({id: number, cb: () => void})[] = [];
  private pendingDelayedCallbacks: ({id: number, cb: () => void, delay: number})[] = [];

  flushBeforeRender(): void {
    while (this.pendingBeforeRenderCallbacks.length) {
      const cb = this.pendingBeforeRenderCallbacks.shift() !.cb;
      cb();
    }
  }

  reset(): void {
    this.pendingBeforeRenderCallbacks.length = 0;
    this.pendingDelayedCallbacks.length = 0;
  }

  schedule(cb: () => void, delay: number): () => void {
    const id = ++this.uid;
    let idx = this.pendingDelayedCallbacks.length;

    for (let i = this.pendingDelayedCallbacks.length - 1; i >= 0; --i) {
      if (this.pendingDelayedCallbacks[i].delay <= delay) {
        idx = i + 1;
        break;
      }
    }
    this.pendingDelayedCallbacks.splice(idx, 0, {id, cb, delay});

    return () => this.remove(id, this.pendingDelayedCallbacks);
  }

  scheduleBeforeRender(cb: () => void): () => void {
    const id = ++this.uid;
    this.pendingBeforeRenderCallbacks.push({id, cb});
    return () => this.remove(id, this.pendingBeforeRenderCallbacks);
  }

  tick(ms: number): void {
    this.flushBeforeRender();

    this.pendingDelayedCallbacks.forEach(item => item.delay -= ms);
    this.pendingDelayedCallbacks = this.pendingDelayedCallbacks.filter(item => {
      if (item.delay <= 0) {
        const cb = item.cb;
        cb();
        return false;
      }
      return true;
    });
  }

  private remove(id: number, items: {id: number}[]): void {
    for (let i = 0, ii = items.length; i < ii; ++i) {
      if (items[i].id === id) {
        items.splice(i, 1);
        break;
      }
    }
  }
}

export class SyncMockScheduler implements MockScheduler {
  schedule(cb: () => void, delay: number): () => void {
    cb();
    return () => undefined;
  }

  scheduleBeforeRender(cb: () => void): () => void {
    cb();
    return () => undefined;
  }
}

export function installMockScheduler(isSync?: false): AsyncMockScheduler;
export function installMockScheduler(isSync: true): SyncMockScheduler;
export function installMockScheduler(isSync?: boolean): AsyncMockScheduler|SyncMockScheduler {
  const mockScheduler = isSync ? new SyncMockScheduler() : new AsyncMockScheduler();

  Object.keys(scheduler).forEach((method: keyof typeof scheduler) => {
    spyOn(scheduler, method).and.callFake(mockScheduler[method].bind(mockScheduler));
  });

  return mockScheduler;
}

export function patchEnv() {
  // This helper function is defined in `test-main.js`. See there for more details.
 // (//window as any).$$patchInnerHtmlProp();
}

export function restoreEnv() {
  // This helper function is defined in `test-main.js`. See there for more details.
  //(window as any).$$restoreInnerHtmlProp();
}

export function supportsCustomElements() {
  // The browser does not natively support custom elements and is not polyfillable.
  return typeof customElements !== 'undefined';
}
