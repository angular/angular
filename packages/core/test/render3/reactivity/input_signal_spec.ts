/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {signal} from '@angular/core';
import {input} from '@angular/core/src/render3/reactivity/input';
import {InputSignal, InputSignalImpl} from '@angular/core/src/render3/reactivity/input_signal';
import {SIGNAL} from '@angular/core/src/signals';

describe('input signals', () => {
  it('should throw before initialization', () => {
    const foo = input<string>();
    expect(foo).toThrow();
  });

  it('should return undefined when created without a default value', () => {
    const foo = input<string>();
    unwrap(foo).initialized();
    expect(foo()).toBe(undefined);
  });

  it('should track a bound expression', () => {
    const expr = signal('test');
    const foo = input<string>();
    const impl = unwrap(foo);

    // Simulate `[foo]="expr()"`
    impl.bindToComputation(() => expr());
    impl.initialized();

    expect(foo()).toBe('test');

    // Updating `expr` should also trigger `foo` to change.
    expr.set('updated');
    expect(foo()).toBe('updated');
  });

  it('should allow setting to a value explicitly', () => {
    const foo = input<string>();
    const impl = unwrap(foo);

    // Simulate `setInput('foo', 'bar')`.
    impl.bindToValue('bar');
    impl.initialized();

    expect(foo()).toBe('bar');

    // Simulate `setInput('foo', 'baz')`.
    impl.bindToValue('baz');
    expect(foo()).toBe('baz');
  });

  describe('with transform', () => {
    it('should transform values when reading', () => {
      const truthy =
          input<boolean, unknown>({initialValue: false, transform: (value: unknown) => !!value});
      const impl = unwrap(truthy);
      impl.initialized();

      expect(truthy()).toBe(false);

      impl.bindToValue('test');
      expect(truthy()).toBe(true);
    });
  });
});

function unwrap<ReadT, WriteT>(signal: InputSignal<ReadT, WriteT>): InputSignalImpl<ReadT, WriteT> {
  return signal[SIGNAL] as InputSignalImpl<ReadT, WriteT>;
}
