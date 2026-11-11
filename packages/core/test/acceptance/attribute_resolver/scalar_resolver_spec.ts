/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {joinTokens, joinValues, lastValue, provideAttributeResolvers} from '@angular/core';

describe('provideAttributeResolvers with the key of an event handler attribute', () => {
  it('throws in dev mode', () => {
    expect(() => provideAttributeResolvers({onclick: lastValue})).toThrowError(
      /`provideAttributeResolvers` can't resolve the `onclick` attribute/,
    );
    expect(() => provideAttributeResolvers({onClick: lastValue})).toThrowError(
      /can't resolve the `onClick` attribute/,
    );
  });
});

describe('built-in attribute resolvers', () => {
  it('lastValue returns the last value, or null for none', () => {
    expect(lastValue('a', 'b')).toBe('b');
    expect(lastValue()).toBeNull();
  });

  it('joinTokens drops repeated tokens, keeping the first, and splits on ASCII whitespace', () => {
    expect(joinTokens('b', 'a b', '', '\tc\n', 'a')).toBe('b a c');
    expect(joinTokens()).toBe('');
  });

  it('joinValues joins with its separator, keeping repeated values, or returns null for none', () => {
    expect(joinValues(' / ')('a', 'b', 'a')).toBe('a / b / a');
    expect(joinValues(', ')()).toBeNull();
  });
});
