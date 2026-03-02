/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {timeout} from '@angular/private/testing';
import {BehaviorSubject, EMPTY, Observable, of, Subscriber, throwError} from 'rxjs';
import {ApplicationRef, Injector, signal} from '../../src/core';
import {TestBed} from '../../testing';
import {rxResource} from '../src';

describe('rxResource()', () => {
  it('should fetch data using an observable loader', async () => {
    const injector = TestBed.inject(Injector);
    const res = rxResource({
      stream: () => of(1),
      injector,
    });

    TestBed.tick();

    // Value should be available synchronously (because the observable emits synchronously)
    expect(res.value()).toBe(1);
    expect(res.status()).toBe('resolved');
  });

  it('should cancel the fetch when a new request comes in', async () => {
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    const request = signal(1);
    let unsub = false;
    let lastSeenRequest: number = 0;
    const res = rxResource({
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

    // The stream isn't evaluated eagerly. We have to wait for the effect to run to see the first request.
    expect(lastSeenRequest).toBe(0);

    TestBed.tick();

    expect(res.status()).toBe('loading');
    expect(lastSeenRequest).toBe(1);

    // Wait for the resource to reach loading state.
    await waitFor(() => lastSeenRequest === 1);

    // Setting request = 2 should cancel request = 1
    request.set(2);
    // The stream is updated asynchronously because we're waiting for the effect to fire.
    expect(lastSeenRequest).toBe(1);
    await appRef.whenStable();
    expect(lastSeenRequest).toBe(2);
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

  it('should reuse observable', async () => {
    let count = 0;
    let sub!: Subscriber<number>;
    const obs = new Observable<number>((s) => {
      sub = s;
      count++;
    });

    const res = rxResource({
      stream: () => obs,
      injector: TestBed.inject(Injector),
    });
    // Hasn't subscribed to the observable yet
    expect(count).toBe(0);

    TestBed.tick();
    expect(count).toBe(1);
    expect(res.status()).toBe('loading');
    sub.next(1);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(count).toBe(1);
  });

  it('should report error synchronously (after tick)', () => {
    const injector = TestBed.inject(Injector);
    const res = rxResource({
      stream: () => EMPTY,
      injector,
    });
    TestBed.tick();
    expect(res.status()).toBe('error');
    expect(res.error()).toBeInstanceOf(Error);
    expect(() => res.value()).toThrowError(/Resource completed before producing a value/);
  });

  it('should report sync error synchronously (after tick) ', () => {
    const injector = TestBed.inject(Injector);
    const res = rxResource({
      stream: () => throwError(() => new Error('bad news')),
      injector,
    });
    TestBed.tick();
    expect(res.status()).toBe('error');
    expect(res.error()).toBeInstanceOf(Error);
    expect(() => res.value()).toThrowError(/bad news/);
  });
});

async function waitFor(fn: () => boolean): Promise<void> {
  while (!fn()) {
    await timeout(1);
  }
}
