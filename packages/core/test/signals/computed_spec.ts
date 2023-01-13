/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, signal, Watch} from '@angular/core/src/signals';

describe('computed', () => {
  it('should create computed', () => {
    const counter = signal(0);

    let computedRunCount = 0;
    const double = computed(() => `${counter() * 2}:${++computedRunCount}`);

    expect(double()).toEqual('0:1');

    counter.set(1);
    expect(double()).toEqual('2:2');
    expect(double()).toEqual('2:2');

    counter.set(2);
    expect(double()).toEqual('4:3');
    expect(double()).toEqual('4:3');
  });

  it('should not re-compute if there are no dependencies', () => {
    let tick = 0;
    const c = computed(() => ++tick);

    expect(c()).toEqual(1);
    expect(c()).toEqual(1);
  });

  it('should not re-compute if the dependency is a primitive value and the value did not change',
     () => {
       const counter = signal(0);

       let computedRunCount = 0;
       const double = computed(() => `${counter() * 2}:${++computedRunCount}`);

       expect(double()).toEqual('0:1');

       counter.set(0);
       expect(double()).toEqual('0:1');
     });

  it('should chain computed', () => {
    const name = signal('abc');
    const reverse = computed(() => name().split('').reverse().join(''));
    const upper = computed(() => reverse().toUpperCase());

    expect(upper()).toEqual('CBA');

    name.set('foo');
    expect(upper()).toEqual('OOF');
  });

  it('should evaluate computed only when subscribing', () => {
    const name = signal('John');
    const show = signal(true);

    let computeCount = 0;
    const displayName = computed(() => `${show() ? name() : 'anonymous'}:${++computeCount}`);

    expect(displayName()).toEqual('John:1');

    show.set(false);
    expect(displayName()).toEqual('anonymous:2');

    name.set('Bob');
    expect(displayName()).toEqual('anonymous:2');
  });

  it('should detect simple dependency cycles', () => {
    const a: () => unknown = computed(() => a());
    expect(() => a()).toThrowError('Detected cycle in computations.');
  });

  it('should detect deep dependency cycles', () => {
    const a: () => unknown = computed(() => b());
    const b = computed(() => c());
    const c = computed(() => d());
    const d = computed(() => a());
    expect(() => a()).toThrowError('Detected cycle in computations.');
  });

  it('should cache exceptions thrown until computed gets dirty again', () => {
    const toggle = signal('KO');
    const c = computed(() => {
      const val = toggle();
      if (val === 'KO') {
        throw new Error('KO');
      } else {
        return val;
      }
    });

    expect(() => c()).toThrowError('KO');
    expect(() => c()).toThrowError('KO');

    toggle.set('OK');
    expect(c()).toEqual('OK');
  });

  it('should not update dependencies of computations when dependencies don\'t change', () => {
    const source = signal(0);
    const isEven = computed(() => source() % 2 === 0);
    let updateCounter = 0;
    const updateTracker = computed(() => {
      isEven();
      return updateCounter++;
    });

    updateTracker();
    expect(updateCounter).toEqual(1);

    source.set(1);
    updateTracker();
    expect(updateCounter).toEqual(2);

    // Setting the counter to another odd value should not trigger `updateTracker` to update.
    source.set(3);
    updateTracker();
    expect(updateCounter).toEqual(2);

    source.set(4);
    updateTracker();
    expect(updateCounter).toEqual(3);
  });

  it('should not mark dirty computed signals that are dirty already', () => {
    const source = signal('a');
    const derived = computed(() => source().toUpperCase());

    let watchCount = 0;
    const watch = new Watch(
        () => {
          derived();
        },
        () => {
          watchCount++;
        },
        false);

    watch.run();
    expect(watchCount).toEqual(0);

    // change signal, mark downstream dependencies dirty
    source.set('b');
    expect(watchCount).toEqual(1);

    // change signal again, downstream dependencies should be dirty already and not marked again
    source.set('c');
    expect(watchCount).toEqual(1);

    // resetting dependencies back to clean
    watch.run();
    expect(watchCount).toEqual(1);

    // expecting another notification at this point
    source.set('d');
    expect(watchCount).toEqual(2);
  });

  it('should disallow writing to signals within computeds', () => {
    const source = signal(0);
    const illegal = computed(() => {
      source.set(1);
      return 0;
    });

    expect(illegal).toThrow();
  });
});
