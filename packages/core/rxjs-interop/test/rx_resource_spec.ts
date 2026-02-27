/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {of, Observable, BehaviorSubject, throwError} from 'rxjs';
import {TestBed} from '../../testing';
import {ApplicationRef, Injector, signal} from '../../src/core';
import {rxResource} from '../src';

describe('rxResource()', () => {
  it('should fetch data using an observable loader', async () => {
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    const res = rxResource({
      stream: () => of(1),
      injector,
    });
    await appRef.whenStable();
    expect(res.value()).toBe(1);
  });

  it('should synchronously resolve when the observable emits synchronously', () => {
    const injector = TestBed.inject(Injector);
    const res = rxResource({
      stream: () => of(1),
      injector,
    });

    // Value should be synchronously available without `await appRef.whenStable()`
    expect(res.value()).toBe(1);
    expect(res.status()).toBe('resolved');
  });

  it('should not subscribe twice if the observable does not emit synchronously', async () => {
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    let subscriber: any;
    let subscribeCount = 0;

    const res = rxResource({
      stream: () =>
        new Observable((sub) => {
          subscriber = sub;
          subscribeCount++;
        }),
      injector,
    });

    // Initial state is loading
    expect(res.status()).toBe('loading');

    // Simulate async emission
    subscriber.next(1);

    // Status is still loading because loadEffect hasn't run to attach the stream yet.
    await appRef.whenStable();
    expect(res.value()).toBe(1);
    expect(subscribeCount).toBe(1); // Ensure it didn't subscribe a second time
  });

  it('should cancel the fetch when a new request comes in', async () => {
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    const request = signal(1);
    let unsub = false;
    let lastSeenRequest: number = 0;
    rxResource({
      params: request,
      stream: ({params: request}) => {
        lastSeenRequest = request;
        return new Observable((sub) => {
          if (request === 2) {
            sub.next(true);
          }
          return () => {
            if (request === 1) {
              unsub = true;
            }
          };
        });
      },
      injector,
    });

    // Wait for the resource to reach loading state.
    await waitFor(() => lastSeenRequest === 1);

    // Setting request = 2 should cancel request = 1
    request.set(2);
    await appRef.whenStable();
    expect(unsub).toBe(true);
  });

  it('should stream when the loader returns multiple values', async () => {
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    const response = new BehaviorSubject(1);
    const res = rxResource({
      stream: () => response,
      injector,
    });
    await appRef.whenStable();
    expect(res.value()).toBe(1);

    response.next(2);
    expect(res.value()).toBe(2);

    response.next(3);
    expect(res.value()).toBe(3);

    response.error('fail');
    expect(res.error()).toEqual(jasmine.objectContaining({cause: 'fail'}));
    expect(res.error()!.message).toContain('Resource');
  });

  it('should cleanup without error when the stream function threw an error', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const res = rxResource({
      stream: () => {
        throw 'oh no';
      },
      injector: appRef.injector,
    });

    // Status is immediately resolved to error state because it threw synchronously in getInitialStream
    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(jasmine.objectContaining({cause: 'oh no'}));
    expect(res.error()!.message).toContain('Resource');

    await appRef.whenStable();
  });

  it('should handle Error like objects', async () => {
    class FooError implements Error {
      name = 'FooError';
      message = 'This is a FooError';
    }

    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);

    const sig = signal(1);
    const observable = throwError(() => new FooError());

    const rxRes = rxResource({
      params: sig,
      stream: () => observable,
      injector: injector,
    });

    await appRef.whenStable();

    expect(rxRes.error()).toBeInstanceOf(FooError);

    expect(() => rxRes.value()).toThrowError(/This is a FooError/);
  });
});

async function waitFor(fn: () => boolean): Promise<void> {
  while (!fn()) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}
