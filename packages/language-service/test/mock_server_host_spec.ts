/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {MockServerHost} from '../testing';

describe('MockServerHost queued scheduler', () => {
  let host: MockServerHost;

  beforeEach(() => {
    initMockFileSystem('Native');
    host = new MockServerHost();
  });

  it('should run queued timeout and immediate callbacks in insertion order', () => {
    const order: string[] = [];
    host.setTimeout(() => order.push('timeout-1'), 100);
    host.setImmediate(() => order.push('immediate-1'));
    host.setTimeout(() => order.push('timeout-2'), 0);

    // Nothing runs until the test environment explicitly yields.
    expect(order).toEqual([]);
    host.flushPendingTimers();
    expect(order).toEqual(['timeout-1', 'immediate-1', 'timeout-2']);

    // Flushing again is a no-op: callbacks run exactly once.
    host.flushPendingTimers();
    expect(order).toEqual(['timeout-1', 'immediate-1', 'timeout-2']);
  });

  it('should honor cancellation via stable handles', () => {
    const order: string[] = [];
    const timeoutId = host.setTimeout(() => order.push('cancelled-timeout'), 0);
    const keptId = host.setTimeout(() => order.push('kept'), 0);
    const immediateId = host.setImmediate(() => order.push('cancelled-immediate'));
    expect(new Set([timeoutId, keptId, immediateId]).size).toBe(3);

    host.clearTimeout(timeoutId);
    host.clearImmediate(immediateId);
    host.flushPendingTimers();
    expect(order).toEqual(['kept']);
  });

  it('should run callbacks scheduled by other callbacks within one flush', () => {
    const order: string[] = [];
    host.setTimeout(() => {
      order.push('outer');
      host.setImmediate(() => order.push('inner'));
    }, 0);

    host.flushPendingTimers();
    expect(order).toEqual(['outer', 'inner']);
  });

  it('should guard against callbacks that reschedule indefinitely', () => {
    const reschedule = (): void => {
      host.setImmediate(reschedule);
    };
    host.setImmediate(reschedule);

    expect(() => host.flushPendingTimers(50)).toThrowError(/rescheduling indefinitely/);
  });
});
