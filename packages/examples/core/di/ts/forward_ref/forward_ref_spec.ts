/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {forwardRef, Inject, Injector, resolveForwardRef} from '@angular/core';

{
  describe('forwardRef examples', () => {
    it('ForwardRefFn example works', () => {
      // #docregion forward_ref_fn
      const ref = forwardRef(() => Lock);
      // #enddocregion
      expect(ref).not.toBeNull();

      class Lock {}
    });

    it('can be used to inject a class defined later', () => {
      // #docregion forward_ref
      class Door {
        lock: Lock;

        // Door attempts to inject Lock, despite it not being defined yet.
        // forwardRef makes this possible.
        constructor(@Inject(forwardRef(() => Lock)) lock: Lock) {
          this.lock = lock;
        }
      }

      // Only at this point Lock is defined.
      class Lock {}

      const injector =
          Injector.create({providers: [{provide: Lock, deps: []}, {provide: Door, deps: [Lock]}]});

      expect(injector.get(Door) instanceof Door).toBe(true);
      expect(injector.get(Door).lock instanceof Lock).toBe(true);
      // #enddocregion
    });

    it('can be unwrapped', () => {
      // #docregion resolve_forward_ref
      const ref = forwardRef(() => 'refValue');
      expect(resolveForwardRef(ref as any)).toEqual('refValue');
      expect(resolveForwardRef('regularValue')).toEqual('regularValue');
      // #enddocregion
    });
  });
}
