/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {debounce, form} from '@angular/forms/signals';
import {timeout} from '@angular/private/testing';

// Repro specs for the `AbortSignal` that `debounce()` passes to a custom debouncer. Each spec
// asserts the expected behavior, so it fails while the bug exists. Specs whose names start with
// `control:` check the test setup and pass today.
describe('debounce() abort signal', () => {
  /** A custom debouncer that records each call's `AbortSignal` and resolver. */
  function recordingDebouncer() {
    const calls: {signal: AbortSignal; resolve: () => void}[] = [];
    const debouncer = (_ctx: unknown, abortSignal: AbortSignal) => {
      const {promise, resolve} = Promise.withResolvers<void>();
      calls.push({signal: abortSignal, resolve});
      return promise;
    };
    return {calls, debouncer};
  }

  // The `pendingSync` doc comment and the async operations guide both promise this.
  it('aborts a custom debouncer as soon as the value is set directly', () => {
    const abort = jasmine.createSpy('abort');
    const f = form(
      signal({name: ''}),
      (p) => {
        debounce(p.name, (_ctx, abortSignal) => {
          abortSignal.addEventListener('abort', abort);
          return new Promise<void>(() => {});
        });
      },
      options(),
    );
    f.name().controlValue.set('typed');

    f.name().value.set('direct');
    expect(abort.calls.count()).withContext('abort listener calls right after value.set()').toBe(1);

    f.name().markAsTouched();
    expect(abort.calls.count())
      .withContext('abort listener calls after markAsTouched() reads pendingSync')
      .toBe(1);
  });

  it('lets an abort listener write a signal', () => {
    const debouncing = signal(false);
    // `dispatchEvent` swallows listener exceptions and reports them later, so catch them here.
    const listenerErrors: string[] = [];
    const f = form(
      signal({name: ''}),
      (p) => {
        debounce(p.name, (_ctx, abortSignal) => {
          debouncing.set(true);
          abortSignal.addEventListener('abort', () => {
            try {
              debouncing.set(false);
            } catch (e) {
              listenerErrors.push(String(e).slice(0, 88));
            }
          });
          return new Promise<void>(() => {});
        });
      },
      options(),
    );
    f.name().controlValue.set('typed');
    f.name().value.set('direct');

    expect(() => f.name().markAsTouched()).not.toThrow();
    expect(listenerErrors)
      .withContext('errors thrown by the signal write in the abort listener')
      .toEqual([]);
    expect(debouncing()).withContext('debouncing flag after the abort').toBeFalse();
  });

  it('lets an abort listener write a signal when the user types again after a direct write', () => {
    const debouncing = signal(false);
    const listenerErrors: string[] = [];
    const f = form(
      signal({name: ''}),
      (p) => {
        debounce(p.name, (_ctx, abortSignal) => {
          debouncing.set(true);
          abortSignal.addEventListener('abort', () => {
            try {
              debouncing.set(false);
            } catch (e) {
              listenerErrors.push(String(e).slice(0, 88));
            }
          });
          return new Promise<void>(() => {});
        });
      },
      options(),
    );
    f.name().controlValue.set('typed');
    f.name().value.set('direct');

    // `debounceSync()` reads `pendingSync` inside `untracked()`, but the stale abort still runs
    // inside the `linkedSignal` computation.
    f.name().controlValue.set('typed again');
    expect(listenerErrors)
      .withContext('errors thrown by the signal write when the next keystroke aborts')
      .toEqual([]);
  });

  it('does not abort a debounce that already completed', async () => {
    const abort = jasmine.createSpy('abort');
    const {calls, debouncer} = recordingDebouncer();
    const f = form(
      signal({name: ''}),
      (p) => {
        debounce(p.name, (ctx, abortSignal) => {
          // Like the guide's example, the listener stays registered after the debounce resolves.
          abortSignal.addEventListener('abort', abort, {once: true});
          return debouncer(ctx, abortSignal);
        });
      },
      options(),
    );
    f.name().controlValue.set('typed');
    calls[0].resolve();
    await timeout();
    expect(f.name().value())
      .withContext('control: model value after the debounce resolves')
      .toBe('typed');
    expect(abort.calls.count())
      .withContext('control: abort calls after the debounce resolves')
      .toBe(0);

    f.name().markAsTouched();
    expect(abort.calls.count())
      .withContext('abort calls on the completed debounce after markAsTouched()')
      .toBe(0);
    expect(calls[0].signal.aborted)
      .withContext('completed debounce AbortSignal.aborted after markAsTouched()')
      .toBeFalse();
  });

  it('lets an abort listener write a signal on blur after a debounce completed', async () => {
    const debouncing = signal(false);
    const listenerErrors: string[] = [];
    const {calls, debouncer} = recordingDebouncer();
    const f = form(
      signal({name: ''}),
      (p) => {
        debounce(p.name, (ctx, abortSignal) => {
          debouncing.set(true);
          abortSignal.addEventListener('abort', () => {
            try {
              debouncing.set(false);
            } catch (e) {
              listenerErrors.push(String(e).slice(0, 88));
            }
          });
          return debouncer(ctx, abortSignal).then(() => debouncing.set(false));
        });
      },
      options(),
    );
    f.name().controlValue.set('typed');
    calls[0].resolve();
    await timeout();
    expect(f.name().value())
      .withContext('control: model value after the debounce resolves')
      .toBe('typed');

    f.name().markAsTouched();
    expect(listenerErrors)
      .withContext('errors thrown by the abort listener on blur after a normal debounce')
      .toEqual([]);
  });

  it('keeps a pending value when a signal read by an earlier abort listener changes', () => {
    const unrelated = signal(0);
    const f = form(
      signal({name: ''}),
      (p) => {
        debounce(p.name, (_ctx, abortSignal) => {
          abortSignal.addEventListener('abort', () => {
            // Any signal read here becomes a dependency of `pendingSync`.
            unrelated();
          });
          return new Promise<void>(() => {});
        });
      },
      options(),
    );
    f.name().controlValue.set('a');
    f.name().value.set('direct');
    // Aborts the first debounce inside the `linkedSignal` computation, which tracks `unrelated`.
    f.name().controlValue.set('b');

    unrelated.set(1);
    f.name().markAsTouched();
    expect(f.name().controlValue()).withContext('control: control value after touch').toBe('b');
    expect(f.name().value()).withContext('model value after touch').toBe('b');
  });

  it('control: a duration debounce that ends after a direct write leaves the model unchanged', async () => {
    const model = signal({name: ''});
    const f = form(
      model,
      (p) => {
        debounce(p.name, 5);
      },
      options(),
    );
    f.name().controlValue.set('typed');
    f.name().value.set('direct');
    const afterDirectWrite = model();

    await timeout(20);
    expect(model()).withContext('model object after the timer fires').toBe(afterDirectWrite);
    expect(f.name().value()).withContext('model value after the timer fires').toBe('direct');
  });
});

function options() {
  return {injector: TestBed.inject(Injector)};
}
