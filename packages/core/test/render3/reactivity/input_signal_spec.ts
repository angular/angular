/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {signal} from '@angular/core';
import {SIGNAL} from '@angular/core/primitives/signals';
import {input} from '@angular/core/src/render3/reactivity/input';
import {InputSignal, InputSignalNode} from '@angular/core/src/render3/reactivity/input_signal';

describe('input signals', () => {
  it('should throw before initialization', () => {
    const foo = input<string>();
    expect(foo).toThrow();
  });

  it('should return undefined when created without a default value', () => {
    const foo = input<string>();
    unwrap(foo).isInitialized = true;
    expect(foo()).toBe(undefined);
  });

  it('should track a bound expression', () => {
    const expr = signal('test');
    const foo = input<string>();
    const impl = unwrap(foo);

    // Simulate `[foo]="expr()"`
    impl.bind(impl, {computation: () => expr()});
    unwrap(foo).isInitialized = true;

    expect(foo()).toBe('test');

    // Updating `expr` should also trigger `foo` to change.
    expr.set('updated');
    expect(foo()).toBe('updated');
  });

  it('should allow setting to a value explicitly', () => {
    const foo = input<string>();
    const impl = unwrap(foo);

    // Simulate `setInput('foo', 'bar')`.
    impl.bind(impl, {value: 'bar'});
    impl.isInitialized = true;

    expect(foo()).toBe('bar');

    // Simulate `setInput('foo', 'baz')`.
    impl.bind(impl, {value: 'baz'});
    expect(foo()).toBe('baz');
  });

  describe('with transform', () => {
    it('should transform values when reading', () => {
      const truthy =
          input<boolean, unknown>({initialValue: false, transform: (value: unknown) => !!value});
      const impl = unwrap(truthy);
      impl.isInitialized = true;

      expect(truthy()).toBe(false);

      impl.bind(impl, {value: 'test'});
      expect(truthy()).toBe(true);
    });
  });
});

function unwrap<ReadT, WriteT>(signal: InputSignal<ReadT, WriteT>): InputSignalNode<ReadT, WriteT> {
  return signal[SIGNAL] as InputSignalNode<ReadT, WriteT>;
}
