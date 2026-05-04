/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {deepSignal} from '../../src/util/deep_signal';

describe('deepSignal', () => {
  it('should allow reading and writing', () => {
    const source = signal({foo: 'bar'});
    const prop = signal('foo' as const);
    const deep = deepSignal(source, prop);

    expect(deep()).toBe('bar');
    deep.set('baz');
    expect(deep()).toBe('baz');
    expect(source().foo).toBe('baz');
  });

  it('should optimize sets with same value on objects', () => {
    const source = signal({foo: 'bar'});
    const prop = signal('foo' as const);
    const deep = deepSignal(source, prop);

    let sourceTriggerCount = 0;
    const derived = computed(() => {
      source();
      sourceTriggerCount++;
      return source().foo;
    });

    // Initial evaluation
    derived();
    expect(sourceTriggerCount).toBe(1);

    // Set to different value
    deep.set('baz');
    derived();
    expect(deep()).toBe('baz');
    expect(source().foo).toBe('baz');
    expect(sourceTriggerCount).toBe(2);

    // Set to SAME value
    deep.set('baz');
    derived();
    expect(sourceTriggerCount).toBe(2); // Should STILL be 2 if optimization works
  });

  it('should optimize sets with same value on arrays', () => {
    const source = signal(['a', 'b', 'c']);
    const prop = signal(1); // index 1, value 'b'
    const deep = deepSignal(source, prop);

    let sourceTriggerCount = 0;
    const derived = computed(() => {
      source();
      sourceTriggerCount++;
      return source()[1];
    });

    // Initial evaluation
    derived();
    expect(sourceTriggerCount).toBe(1);

    // Set to different value
    deep.set('x');
    derived();
    expect(deep()).toBe('x');
    expect(source()[1]).toBe('x');
    expect(sourceTriggerCount).toBe(2);

    // Set to SAME value
    deep.set('x');
    derived();
    expect(sourceTriggerCount).toBe(2); // Should STILL be 2 if optimization works
  });
});
