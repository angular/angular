/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createComputed} from '../src/computed';
import {formatter} from '../src/formatter';
import {createSignal} from '../src/signal';

describe('Signal DevTools Formatter', () => {
  it('should detect a Signal', () => {
    const sigGetter = createSignal(42)[0];
    expect(formatter.header(sigGetter, {}) as any).toBeInstanceOf(Array);
  });

  it('should not detect a Proxy as a Signal', () => {
    // This proxyObj will not return undefined for the `SIGNAL` key.
    const proxyObj = new Proxy({}, {get: () => 'pizza'});

    expect(formatter.header(proxyObj, {})).toBeNull();
  });

  it('should format signal with error', () => {
    const computed = createComputed(() => {
      throw new Error('computation failed');
    });

    expect(formatter.header(computed, {}) as any).toEqual([
      'span',
      'Signal(⚠️ Error): computation failed',
    ]);
  });
});
