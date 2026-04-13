/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {of, Observable, BehaviorSubject, throwError} from 'rxjs';
import {TestBed} from '../../testing';
import {timeout} from '@angular/private/testing';
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
    let lastSeenRequest: number | null = 0;
    rxResource({
      params: request,
      stream: ({ params: request }) => {
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
    expect(res.error()).toEqual(jasmine.objectContaining({ cause: 'fail' }));
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

  it('should receive null params at runtime when params option is not provided', async () => {
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    let receivedParams: unknown = 'NOT_SET';

    const res = rxResource({
      // No `params` option — defaults to () => null! internally
      stream: ({ params }) => {
        receivedParams = params;
        return of('result');
      },
      injector,
    });

    await appRef.whenStable();
    // When no params function is provided, the resource defaults to `() => null!` internally,
    // so params inside the stream callback should be null at runtime.
    expect(receivedParams).toBeNull();
    expect(res.value()).toBe('result');
  });

  it('should type params as including null when params option can be undefined (issue #62724)', async () => {
    const injector = TestBed.inject(Injector);

    // This should compile without TypeScript errors.
    // Before the fix, `params` was typed as `string` — missing `null`.
    // After the fix, `params` is typed as `string | null`.
    const getParamsFn = (): (() => string) | undefined => undefined;

    // The key assertion: assigning `params` to `string | null` must compile.
    rxResource({
      params: getParamsFn(),
      stream: ({ params }) => {
        // TypeScript must allow: params is `string | null`, not just `string`
        const _typeCheck: string | null = params;
        return of(_typeCheck ?? 'fallback');
      },
      injector,
    });
  });
});

async function waitFor(fn: () => boolean): Promise<void> {
  while (!fn()) {
    await timeout(1);
  }
}
