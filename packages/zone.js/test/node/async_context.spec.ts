/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AsyncLocalStorage, executionAsyncId} from 'async_hooks';

describe('Node.js async context', () => {
  const als = new AsyncLocalStorage<string>();

  /**
   * Runs `fn` as an independent concurrent operation, as a server would run a request: in its own
   * Zone and in its own `AsyncLocalStorage` store.
   */
  function asOperation(name: string, fn: () => void): void {
    Zone.root.fork({name: `op-${name}`}).run(() => als.run(name, fn));
  }

  /** Resolves once the microtask queue and the task which drains it have run. */
  function settled(): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, 1));
  }

  it('should run a reaction of an already resolved promise in the store it was registered in', async () => {
    const stores: (string | undefined)[] = [];
    const zones: string[] = [];

    // Both reactions are queued in the same microtask, which the host runs in the context of
    // whichever operation queued it first.
    asOperation('a', () => {
      Promise.resolve().then(() => {
        stores.push(als.getStore());
        zones.push(Zone.current.name);
      });
    });
    asOperation('b', () => {
      Promise.resolve().then(() => {
        stores.push(als.getStore());
        zones.push(Zone.current.name);
      });
    });
    await settled();

    expect(stores).toEqual(['a', 'b']);
    expect(zones).toEqual(['op-a', 'op-b']);
  });

  it('should run reactions of one shared pending promise in the stores they were registered in', async () => {
    const stores: (string | undefined)[] = [];
    let resolveShared!: () => void;
    const shared = new Promise<void>((resolve) => (resolveShared = resolve));

    asOperation('a', () => {
      shared.then(() => stores.push(als.getStore()));
    });
    asOperation('b', () => {
      shared.then(() => stores.push(als.getStore()));
    });
    // The promise is settled by neither operation, as a callback of a shared connection would.
    asOperation('c', () => resolveShared());
    await settled();

    expect(stores).toEqual(['a', 'b']);
  });

  it('should keep the store of the registering operation in a chain of reactions', async () => {
    const stores: (string | undefined)[] = [];

    for (const name of ['a', 'b']) {
      asOperation(name, () => {
        Promise.resolve()
          .then(() => {})
          .then(() => {})
          .then(() => stores.push(als.getStore()));
      });
    }
    await settled();

    expect(stores).toEqual(['a', 'b']);
  });

  it('should run a `finally` callback in the store it was registered in', async () => {
    const stores: (string | undefined)[] = [];

    for (const name of ['a', 'b']) {
      asOperation(name, () => {
        Promise.resolve().finally(() => stores.push(als.getStore()));
      });
    }
    await settled();

    expect(stores).toEqual(['a', 'b']);
  });

  it('should run a rejection handler in the store it was registered in', async () => {
    const stores: (string | undefined)[] = [];

    for (const name of ['a', 'b']) {
      asOperation(name, () => {
        Promise.reject(new Error('nope')).catch(() => stores.push(als.getStore()));
      });
    }
    await settled();

    expect(stores).toEqual(['a', 'b']);
  });

  it('should run a `queueMicrotask` callback in the store it was queued in', async () => {
    const stores: (string | undefined)[] = [];

    for (const name of ['a', 'b']) {
      asOperation(name, () => {
        queueMicrotask(() => stores.push(als.getStore()));
      });
    }
    await settled();

    expect(stores).toEqual(['a', 'b']);
  });

  it('should run the task hooks of a reaction in the store it was registered in', async () => {
    // `NgZone` tracks stability through `onHasTask` and runs change detection from it, so the
    // hooks of a task have to run in the same store as its callback, not in the store of whichever
    // operation queued the shared microtask.
    const stores: (string | undefined)[] = [];

    for (const name of ['a', 'b']) {
      const zone = Zone.root.fork({
        name: `op-${name}`,
        onHasTask: (delegate, current, target, hasTaskState) => {
          if (hasTaskState.change === 'microTask' && !hasTaskState.microTask) {
            stores.push(als.getStore());
          }
          return delegate.hasTask(target, hasTaskState);
        },
      });
      zone.run(() => als.run(name, () => Promise.resolve().then(() => {})));
    }
    await settled();

    expect(stores).toEqual(['a', 'b']);
  });

  it('should report an error thrown by a microtask in the store it was queued in', async () => {
    // The error leaves the task, so reporting it happens after the callback; it must still be
    // attributed to the operation which queued the microtask.
    const ignoreConsoleError = Zone.__symbol__('ignoreConsoleErrorUncaughtError');
    const previous = (Zone as any)[ignoreConsoleError];
    (Zone as any)[ignoreConsoleError] = false;
    const stores: (string | undefined)[] = [];
    spyOn(console, 'error').and.callFake((...args: unknown[]) => {
      if (args.some((arg) => String((arg as Error)?.message ?? arg).includes('thrown by a task'))) {
        stores.push(als.getStore());
      }
    });

    for (const name of ['a', 'b']) {
      asOperation(name, () => {
        queueMicrotask(() => {
          throw new Error(`thrown by a task of ${name}`);
        });
      });
    }
    await settled();
    (Zone as any)[ignoreConsoleError] = previous;

    expect(stores).toEqual(['a', 'b']);
  });

  it('should report an unhandled rejection in the store it was rejected in', async () => {
    return await jasmine.spyOnGlobalErrorsAsync(async () => {
      const ignoreConsoleError = Zone.__symbol__('ignoreConsoleErrorUncaughtError');
      const previous = (Zone as any)[ignoreConsoleError];
      (Zone as any)[ignoreConsoleError] = true;
      const stores: (string | undefined)[] = [];
      const listener = () => stores.push(als.getStore());
      process.on('unhandledRejection', listener);

      try {
        for (const name of ['a', 'b']) {
          asOperation(name, () => {
            Promise.reject(new Error(`rejected in ${name}`));
          });
        }
        await settled();

        expect(stores).toEqual(['a', 'b']);
      } finally {
        process.removeListener('unhandledRejection', listener);
        (Zone as any)[ignoreConsoleError] = previous;
      }
    });
  });

  it('should keep rejecting a `queueMicrotask` call without a callback', () => {
    // The capture must not turn an invalid call into a microtask which fails later.
    expect(() => (queueMicrotask as (callback?: unknown) => void)(undefined)).toThrow();
  });

  it('should restore the async resource of the registering operation', async () => {
    // Libraries which track context through `async_hooks` rather than through
    // `AsyncLocalStorage` rely on the reaction running in the async resource of the operation
    // which registered it, and not in the one microtask shared by the whole process.
    const ids: number[] = [];

    for (const name of ['a', 'b']) {
      asOperation(name, () => {
        Promise.resolve().then(() => ids.push(executionAsyncId()));
      });
    }
    await settled();

    const [ranForA, ranForB] = ids;
    expect(ranForA).not.toBe(ranForB);
  });
});
