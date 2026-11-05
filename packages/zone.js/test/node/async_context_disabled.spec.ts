/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AsyncLocalStorage} from 'async_hooks';

describe('Node.js async context with __Zone_disable_asyncContext', () => {
  it('should run reactions in the async context of the shared microtask', async () => {
    const als = new AsyncLocalStorage<string>();
    const stores: (string | undefined)[] = [];
    let resolveShared!: () => void;
    const shared = new Promise<void>((resolve) => (resolveShared = resolve));

    for (const name of ['a', 'b']) {
      als.run(name, () => {
        shared.then(() => stores.push(als.getStore()));
      });
    }
    // The timer drains the microtask queue when it ends, in the context it was set in.
    als.run('c', () => setTimeout(resolveShared));
    await new Promise<void>((resolve) => setTimeout(resolve, 1));

    expect(stores).toEqual(['c', 'c']);
  });
});
