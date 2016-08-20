require('source-map-support').install();

import {difference, isMainWorkspace, targetToPath} from 'ibazel/utils';

describe('isMainWorkspace', () => {
  it('identifies main workspace', () => {
    expect(isMainWorkspace('//hello')).toBe(true);

    expect(isMainWorkspace('@ws//bello')).toBe(false);
    expect(isMainWorkspace('hello:world')).toBe(false);
  });
});

describe(
    'targetToPath',
    () => {it('converts target to path', () => {
      expect(targetToPath('//:angular/core/index.ts')).toEqual('angular/core/index.ts');
      expect(targetToPath('//angular/core:index.ts')).toEqual('angular/core/index.ts');
    })});

describe('difference', () => {
  it('diffs two empty arrays',
     () => { expect(difference([], [])).toEqual({removed: [], added: []}); });

  it('diffs two equal arrays',
     () => { expect(difference(['a'], ['a'])).toEqual({removed: [], added: []}); });

  it('diffs an added element',
     () => { expect(difference([], ['a'])).toEqual({removed: [], added: ['a']}); });

  it('diffs a deleted element',
     () => { expect(difference(['b'], [])).toEqual({removed: ['b'], added: []}); });

  it('diffs unsorted arrays', () => {
    expect(difference(['a', 'b'], ['b', 'a'])).toEqual({removed: [], added: []});
  });

  it('diffs everything', () => {
    const diff = difference(['a', 'b', 'c'], ['b', 'd', 'e']);
    expect(diff).toEqual({
      removed: jasmine.arrayContaining(['a', 'c']),
      added: jasmine.arrayContaining(['d', 'e'])
    });
    expect(diff.removed.length).toEqual(2);
    expect(diff.added.length).toEqual(2);
  })
});
