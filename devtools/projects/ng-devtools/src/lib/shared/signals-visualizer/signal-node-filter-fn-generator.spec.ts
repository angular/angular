/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  parseSignalNodeFilter,
  signalNodeFilterFnGenerator,
  tokenizeSignalNodeFilter,
} from './signal-node-filter-fn-generator';

describe('tokenizeSignalNodeFilter', () => {
  it('should tokenize an empty string', () => {
    const tokens = tokenizeSignalNodeFilter('');
    expect(tokens).toEqual([]);
  });

  it('should tokenize a simple string', () => {
    const tokens = tokenizeSignalNodeFilter('signal name');
    expect(tokens).toEqual([
      {type: 'word', value: 'signal'},
      {type: 'space', value: ' '},
      {type: 'word', value: 'name'},
    ]);
  });

  it('should tokenize a filter', () => {
    const tokens = tokenizeSignalNodeFilter('type:computed');
    expect(tokens).toEqual([
      {type: 'word', value: 'type'},
      {type: 'colon', value: ':'},
      {type: 'word', value: 'computed'},
    ]);
  });

  it('should tokenize multiple filters', () => {
    const tokens = tokenizeSignalNodeFilter('type:computed foo:bar');
    expect(tokens).toEqual([
      {type: 'word', value: 'type'},
      {type: 'colon', value: ':'},
      {type: 'word', value: 'computed'},
      {type: 'space', value: ' '},
      {type: 'word', value: 'foo'},
      {type: 'colon', value: ':'},
      {type: 'word', value: 'bar'},
    ]);
  });

  it('should tokenize multiple filters with multiple free words', () => {
    const tokens = tokenizeSignalNodeFilter('namedSignal type:signal  baz foo:bar  qux quux');
    expect(tokens).toEqual([
      {type: 'word', value: 'namedSignal'},
      {type: 'space', value: ' '},
      {type: 'word', value: 'type'},
      {type: 'colon', value: ':'},
      {type: 'word', value: 'signal'},
      {type: 'space', value: ' '},
      {type: 'space', value: ' '},
      {type: 'word', value: 'baz'},
      {type: 'space', value: ' '},
      {type: 'word', value: 'foo'},
      {type: 'colon', value: ':'},
      {type: 'word', value: 'bar'},
      {type: 'space', value: ' '},
      {type: 'space', value: ' '},
      {type: 'word', value: 'qux'},
      {type: 'space', value: ' '},
      {type: 'word', value: 'quux'},
    ]);
  });
});

describe('parseSignalNodeFilter', () => {
  it('should parse an empty string to an empty tokens array', () => {
    const tokens = tokenizeSignalNodeFilter('');
    const parsed = parseSignalNodeFilter(tokens);

    expect(parsed.freeText).toBe('');
    expect(parsed.filters).toEqual([]);
  });

  it('should parse a simple string', () => {
    const tokens = tokenizeSignalNodeFilter('signal name');
    const parsed = parseSignalNodeFilter(tokens);

    expect(parsed.freeText).toBe('signal name');
    expect(parsed.filters).toEqual([]);
  });

  it('should parse a filter', () => {
    const tokens = tokenizeSignalNodeFilter('type:computed');
    const parsed = parseSignalNodeFilter(tokens);

    expect(parsed.freeText).toBe('');
    expect(parsed.filters).toEqual([{type: 'type', value: 'computed'}]);
  });

  it('should parse multiple filters', () => {
    const tokens = tokenizeSignalNodeFilter('type:computed foo:bar');
    const parsed = parseSignalNodeFilter(tokens);

    expect(parsed.freeText).toBe('');
    expect(parsed.filters).toEqual([
      {type: 'type', value: 'computed'},
      {type: 'foo', value: 'bar'},
    ]);
  });

  it('should tokenize multiple filters with multiple free words', () => {
    const tokens = tokenizeSignalNodeFilter('namedSignal type:signal  baz foo:bar  qux quux');
    const parsed = parseSignalNodeFilter(tokens);

    expect(parsed.freeText).toBe('namedSignal baz qux quux');
    expect(parsed.filters).toEqual([
      {type: 'type', value: 'signal'},
      {type: 'foo', value: 'bar'},
    ]);
  });
});

describe('signalNodeFilterFnGenerator', () => {
  it('should NOT match an empty string input (source)', () => {
    const filterFn = signalNodeFilterFnGenerator('');
    const matches = filterFn({label: 'foo', type: 'signal'});

    expect(matches.length).toBe(0);
  });

  it('should match free text', () => {
    const filterFn = signalNodeFilterFnGenerator('_baz');
    const matches = filterFn({label: 'foo_baz', type: 'signal'});

    expect(matches).toEqual([
      {
        startIdx: 3,
        endIdx: 7,
      },
    ]);
  });

  it('should match type filters', () => {
    const filterFn = signalNodeFilterFnGenerator('type:signal');
    const matches = filterFn({label: 'foo', type: 'signal'});

    // Type-only match should result in an empty free text match (i.e. start and end = 0).
    expect(matches).toEqual([
      {
        startIdx: 0,
        endIdx: 0,
      },
    ]);
  });

  it('should match free text and type filter', () => {
    const filterFn = signalNodeFilterFnGenerator('type:signal fo');
    const matches = filterFn({label: 'foo', type: 'signal'});

    expect(matches).toEqual([
      {
        startIdx: 0,
        endIdx: 2,
      },
    ]);
  });

  it(`should NOT match free text if the type filter doesn't match the source`, () => {
    const filterFn = signalNodeFilterFnGenerator('type:computed fo');
    const matches = filterFn({label: 'foo', type: 'signal'});

    expect(matches.length).toBe(0);
  });

  it(`should NOT match the type filter if the free text doesn't match the source`, () => {
    const filterFn = signalNodeFilterFnGenerator('type:signal baz');
    const matches = filterFn({label: 'foo', type: 'signal'});

    expect(matches.length).toBe(0);
  });

  it('should NOT match the source if there are multiple type filters', () => {
    const filterFn = signalNodeFilterFnGenerator('type:effect type:linkedSignal');
    const matches = filterFn({label: '', type: 'effect'});

    expect(matches.length).toBe(0);
  });
});
