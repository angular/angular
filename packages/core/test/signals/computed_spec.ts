/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '../../src/core';
import {
  createWatch,
  ReactiveNode,
  SIGNAL,
  defaultEquals,
  setPostProducerCreatedFn,
} from '../../primitives/signals';
import {flushEffects, testingEffect} from './effect_util';

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

  it('should not re-compute if the dependency is a primitive value and the value did not change', () => {
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
    const age = signal(25);
    const show = signal(true);

    let computeCount = 0;
    const displayName = computed(
      () => `${show() ? `${name()} aged ${age()}` : 'anonymous'}:${++computeCount}`,
    );

    expect(displayName()).toEqual('John aged 25:1');

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

  it("should not update dependencies of computations when dependencies don't change", () => {
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
    const w = createWatch(
      () => {
        derived();
      },
      () => {
        watchCount++;
      },
      false,
    );

    w.run();
    expect(watchCount).toEqual(0);

    // change signal, mark downstream dependencies dirty
    source.set('b');
    expect(watchCount).toEqual(1);

    // change signal again, downstream dependencies should be dirty already and not marked again
    source.set('c');
    expect(watchCount).toEqual(1);

    // resetting dependencies back to clean
    w.run();
    expect(watchCount).toEqual(1);

    // expecting another notification at this point
    source.set('d');
    expect(watchCount).toEqual(2);
  });

  it('should allow signal creation within computed', () => {
    const doubleCounter = computed(() => {
      const counter = signal(1);
      return counter() * 2;
    });

    expect(doubleCounter()).toBe(2);
  });

  it('should disallow writing to signals within computed', () => {
    const source = signal(0);
    const illegal = computed(() => {
      source.set(1);
      return 0;
    });

    expect(illegal).toThrow();
  });

  it('should have a toString implementation', () => {
    const counter = signal(1);
    const double = computed(() => counter() * 2);
    expect(double + '').toBe('[Computed: 2]');
  });

  it('should have a toString implementation with debugName', () => {
    const counter = signal(1);
    const double = computed(() => counter() * 2, {debugName: 'double'});
    expect(double + '').toBe('[Computed (double): 2]');
  });

  it('should set debugName when a debugName is provided', () => {
    const primitiveSignal = signal(0);
    const node = computed(() => primitiveSignal(), {debugName: 'computedSignal'})[
      SIGNAL
    ] as ReactiveNode;
    expect(node.debugName).toBe('computedSignal');
  });

  describe('with custom equal', () => {
    it('should cache exceptions thrown by equal', () => {
      const s = signal(0);

      let computedRunCount = 0;
      let equalRunCount = 0;
      const c = computed(
        () => {
          computedRunCount++;
          return s();
        },
        {
          equal: () => {
            equalRunCount++;
            throw new Error('equal');
          },
        },
      );

      // equal() isn't run for the initial computation.
      expect(c()).toBe(0);
      expect(computedRunCount).toBe(1);
      expect(equalRunCount).toBe(0);

      s.set(1);

      // Error is thrown by equal().
      expect(() => c()).toThrowError('equal');
      expect(computedRunCount).toBe(2);
      expect(equalRunCount).toBe(1);

      // Error is cached; c throws again without needing to rerun computation or equal().
      expect(() => c()).toThrowError('equal');
      expect(computedRunCount).toBe(2);
      expect(equalRunCount).toBe(1);
    });

    it('should not track signal reads inside equal', () => {
      const value = signal(1);
      const epsilon = signal(0.5);

      let innerRunCount = 0;
      let equalRunCount = 0;
      const inner = computed(
        () => {
          innerRunCount++;
          return value();
        },
        {
          equal: (a, b) => {
            equalRunCount++;
            return Math.abs(a - b) < epsilon();
          },
        },
      );

      let outerRunCount = 0;
      const outer = computed(() => {
        outerRunCount++;
        return inner();
      });

      // Everything runs the first time.
      expect(outer()).toBe(1);
      expect(innerRunCount).toBe(1);
      expect(outerRunCount).toBe(1);

      // Difference is less than epsilon().
      value.set(1.2);

      // `inner` reruns because `value` was changed, and `equal` is called for the first time.
      expect(outer()).toBe(1);
      expect(innerRunCount).toBe(2);
      expect(equalRunCount).toBe(1);
      // `outer does not rerun because `equal` determined that `inner` had not changed.
      expect(outerRunCount).toBe(1);

      // Previous difference is now greater than epsilon().
      epsilon.set(0.1);

      // While changing `epsilon` would change the outcome of the `inner`, we don't rerun it
      // because we intentionally don't track reactive reads in `equal`.
      expect(outer()).toBe(1);
      expect(innerRunCount).toBe(2);
      expect(equalRunCount).toBe(1);
      // Equally important is that the signal read in `equal` doesn't leak into the outer reactive
      // context either.
      expect(outerRunCount).toBe(1);
    });

    it('should recover from exception', () => {
      let shouldThrow = true;
      const source = signal(0);
      const derived = computed(source, {
        equal: (a, b) => {
          if (shouldThrow) {
            throw new Error('equal');
          }
          return defaultEquals(a, b);
        },
      });

      // Initial read doesn't throw because it doesn't call `equal`.
      expect(derived()).toBe(0);

      // Update `source` to begin throwing.
      source.set(1);
      expect(() => derived()).toThrowError('equal');

      // Stop throwing and update `source` to cause `derived` to recompute.
      shouldThrow = false;
      source.set(2);
      expect(derived()).toBe(2);
    });
  });

  it('should call the post-producer-created fn when signal is called', () => {
    const producerKindsCreated: string[] = [];
    const prev = setPostProducerCreatedFn((node) => producerKindsCreated.push(node.kind));
    const count = signal(0);
    computed(() => count() % 2 === 0);

    expect(producerKindsCreated).toEqual(['signal', 'computed']);
    setPostProducerCreatedFn(prev);
  });

  it('should keep links alive in a dynamic graph', () => {
    // This test verifies that reactive links between producer <> consumers are correctly maintained in a dynamic graph.
    const decoy = signal(0);
    const dynamic = signal(0);
    const trigger = signal(false);

    let executed = 0;
    testingEffect(() => {
      // Let the initial execution of the effect evaluate the decoy signal, incurring a consumer edge in the graph.
      if (executed === 0) {
        decoy();
      }

      // Evaluate a second signal; in the first execution this is the second consumer while it will be the first
      // consumer in subsequent executions. The dynamic nature of this consumer means that its reactive link from the
      // initial execution is not being reused in the second execution, as it is masked by the presence of the by-then
      // stale link of `decoy`. Since the decoy is set to be unlinked, so will its followers as a mismatch in
      // consumer ordering cause the entire chain of consumers to become invalid.
      dynamic();

      // Evaluate another signal last such that `dynamic` is not at the tail end of the effect's producer links, as that
      // would also allow the consumer link of `dynamic` to be found and reused.
      trigger();

      executed++;
    });
    flushEffects();
    expect(executed).toEqual(1);

    // Initiate a change through the trigger signal, causing the removal of `decoy` to be noticed without touching the
    // value of `dynamic`.
    trigger.set(true);
    flushEffects();
    expect(executed).toEqual(2);

    // Verify that updates to the decoy no longer cause the effect to run.
    decoy.update((v) => v + 1);
    flushEffects();
    expect(executed).toEqual(2);

    // Also verify that updates of the dynamic consumer are still tracked, causing the effect to rerun.
    dynamic.update((v) => v + 1);
    flushEffects();
    expect(executed).toEqual(3);
  });

  it('should keep links alive in a dynamic graph 2', () => {
    const a = signal(0, {debugName: 'a'});
    const trigger = signal(0, {debugName: 'trigger'});

    let executed = 0;
    testingEffect(() => {
      if (executed === 0) {
        a();
        a.update((v) => v + 1);
      }

      trigger();

      executed++;
    });
    flushEffects();
    expect(executed).toEqual(2);

    trigger.update((v) => v + 1);
    flushEffects();
    expect(executed).toEqual(3);
  });
});
