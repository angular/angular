/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {of, Observable, BehaviorSubject} from 'rxjs';
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
});

async function waitFor(fn: () => boolean): Promise<void> {
  while (!fn()) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}
