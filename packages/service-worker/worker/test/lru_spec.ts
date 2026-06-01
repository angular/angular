/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LruList} from '../src/data';

/**
 * These tests cover prototype-key safety in LruList. The root cause is that
 * state.map is a plain `{}`, so `map['__proto__']` returns `Object.prototype`
 * (truthy, not undefined) and `map['constructor']` returns `Object`. The LruList
 * logic reads map[url] !== undefined to decide whether a node already exists;
 * when the key is inherited from Object.prototype that check produces false
 * positives, causing TypeError on the subsequent remove() path.
 *
 * Fix: use Object.create(null) for every map allocation so no inherited keys exist.
 */
describe('LruList - prototype-safe key handling', () => {
  // -------------------------------------------------------------------------
  // Failing tests: reproduce each corruption mode
  // -------------------------------------------------------------------------

  it('accessed(__proto__) on a fresh LruList should not throw', () => {
    // map['__proto__'] on a plain {} returns Object.prototype (truthy, not
    // undefined), so the code enters the remove() path with Object.prototype
    // as the node. node.previous is undefined, map[undefined] is undefined,
    // and previous.next = … throws TypeError.
    const lru = new LruList();
    expect(() => lru.accessed('__proto__')).not.toThrow();
    expect(lru.size).toBe(1);
  });

  it('accessed(__proto__) should store __proto__ as a real entry', () => {
    const lru = new LruList();
    lru.accessed('__proto__');
    // Without the fix, accessed() throws before reaching this line.
    expect(lru.size).toBe(1);
    expect(lru.remove('__proto__')).toBeTrue();
    expect(lru.size).toBe(0);
  });

  it('accessed(constructor) on a fresh LruList should not throw', () => {
    // map['constructor'] on a plain {} returns the Object constructor
    // (truthy, not undefined), triggering the same false-positive remove() path.
    const lru = new LruList();
    expect(() => lru.accessed('constructor')).not.toThrow();
    expect(lru.size).toBe(1);
  });

  it('re-adding __proto__ after it was the sole entry and was removed should not throw', () => {
    // When the last node is removed, remove() resets: this.state.map = {}
    // The fresh {} has the same __proto__ accessor issue, so a second
    // accessed('__proto__') call throws even though the first worked.
    const lru = new LruList();
    lru.accessed('/safe');
    lru.accessed('__proto__');
    lru.remove('__proto__'); // removes __proto__; when it is the only node,
    lru.remove('/safe'); // this triggers map = {} reset inside remove()
    expect(lru.size).toBe(0);

    // Re-add after the map was reset
    expect(() => lru.accessed('__proto__')).not.toThrow();
    expect(lru.size).toBe(1);
  });

  it('loading a deserialized LruState where map has __proto__ key should not throw', () => {
    // Simulates the service worker loading LruState from Cache Storage
    // via JSON.parse. JSON.parse stores "__proto__" as an own data property
    // (bypassing the setter), so the first remove() works in modern V8.
    // The corruption appears on the next write cycle after remove() resets
    // this.state.map back to a plain {}.
    const rawJson =
      '{"head":"__proto__","tail":"__proto__",' +
      '"map":{"__proto__":{"url":"__proto__","next":null,"previous":null}},' +
      '"count":1}';
    const state = JSON.parse(rawJson) as Parameters<
      typeof LruList.prototype.accessed
    >[0] extends string
      ? never
      : any;

    const lru = new LruList(state);
    expect(lru.size).toBe(1);

    // Remove the single entry – triggers the map = {} reset path
    expect(() => lru.remove('__proto__')).not.toThrow();
    expect(lru.size).toBe(0);

    // After the reset, adding __proto__ back must not throw
    expect(() => lru.accessed('__proto__')).not.toThrow();
    expect(lru.size).toBe(1);
  });
});
