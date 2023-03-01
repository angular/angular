/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, signal} from '@angular/core/src/signals';

describe('glitch-free computations', () => {
  it('should recompute only once for diamond dependency graph', () => {
    let fullRecompute = 0;

    const name = signal('John Doe');
    const first = computed(() => name().split(' ')[0]);
    const last = computed(() => name().split(' ')[1]);
    const full = computed(() => {
      fullRecompute++;
      return `${first()}/${last()}`;
    });

    expect(full()).toEqual('John/Doe');
    expect(fullRecompute).toEqual(1);

    name.set('Bob Fisher');
    expect(full()).toEqual('Bob/Fisher');
    expect(fullRecompute).toEqual(2);
  });

  it('should recompute only once', () => {
    const a = signal('a');
    const b = computed(() => a() + 'b');
    let cRecompute = 0;
    const c = computed(() => {
      return `${a()}|${b()}|${++cRecompute}`;
    });

    expect(c()).toEqual('a|ab|1');

    a.set('A');
    expect(c()).toEqual('A|Ab|2');
  });
});
