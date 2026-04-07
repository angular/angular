/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, effect, input} from '../../src/core';
import {SIGNAL} from '../../primitives/signals';
import {TestBed} from '../../testing';

describe('input signal', () => {
  it('should properly notify live consumers (effect)', () => {
    @Component({
      template: '',
      standalone: false,
    })
    class TestCmp {
      input = input(0);
      effectCalled = 0;

      constructor() {
        effect(() => {
          this.effectCalled++;
          this.input();
        });
      }
    }

    const fixture = TestBed.createComponent(TestCmp);
    const node = fixture.componentInstance.input[SIGNAL];
    fixture.detectChanges();

    expect(fixture.componentInstance.effectCalled).toBe(1);

    node.applyValueToInputSignal(node, 1);
    fixture.detectChanges();
    expect(fixture.componentInstance.effectCalled).toBe(2);
  });

  it('should work with computed expressions', () => {
    TestBed.runInInjectionContext(() => {
      const signal = input(0);
      let computedCount = 0;
      const derived = computed(() => (computedCount++, signal() + 1000));

      const node = signal[SIGNAL];
      expect(derived()).toBe(1000);
      expect(computedCount).toBe(1);

      node.applyValueToInputSignal(node, 1);
      expect(computedCount).toBe(1);

      expect(derived()).toBe(1001);
      expect(computedCount).toBe(2);
    });
  });

  it('should capture transform for later use in framework', () => {
    TestBed.runInInjectionContext(() => {
      const signal = input(0, {transform: (v: number) => v + 1000});
      const node = signal[SIGNAL];

      expect(node.transformFn?.(1)).toBe(1001);
    });
  });

  it('should throw if there is no value for required inputs', () => {
    TestBed.runInInjectionContext(() => {
      const signal = input.required();
      const node = signal[SIGNAL];

      expect(() => signal()).toThrowError(/Input is required but no value is available yet\./);

      node.applyValueToInputSignal(node, 1);
      expect(signal()).toBe(1);
    });
  });

  it('should include debugName in required inputs error message, if available', () => {
    TestBed.runInInjectionContext(() => {
      const signal = input.required({debugName: 'mySignal'});
      const node = signal[SIGNAL];

      expect(() => signal()).toThrowError(
        /Input "mySignal" is required but no value is available yet\./,
      );

      node.applyValueToInputSignal(node, 1);
      expect(signal()).toBe(1);
    });
  });

  it('should include alias in required inputs error message, if available', () => {
    TestBed.runInInjectionContext(() => {
      const signal = input.required({alias: 'alias'});
      const node = signal[SIGNAL];

      expect(() => signal()).toThrowError(
        /Input "alias" is required but no value is available yet\./,
      );

      node.applyValueToInputSignal(node, 1);
      expect(signal()).toBe(1);
    });
  });

  it('should throw if a `computed` depends on an uninitialized required input', () => {
    TestBed.runInInjectionContext(() => {
      const signal = input.required<number>();
      const expr = computed(() => signal() + 1000);
      const node = signal[SIGNAL];

      expect(() => expr()).toThrowError(/Input is required but no value is available yet\./);

      node.applyValueToInputSignal(node, 1);
      expect(expr()).toBe(1001);
    });
  });

  it('should have a toString implementation', () => {
    TestBed.runInInjectionContext(() => {
      const signal = input(0);
      expect(signal + '').toBe('[Input Signal: 0]');
    });
  });
});
