/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, ReflectiveInjector, forwardRef, resolveForwardRef} from '@angular/core';

export function main() {
  describe('forwardRef examples', () => {
    it('ForwardRefFn example works', () => {
      // #docregion forward_ref_fn
      let ref = forwardRef(() => Lock);
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
        constructor(@Inject(forwardRef(() => Lock)) lock: Lock) { this.lock = lock; }
      }

      // Only at this point Lock is defined.
      class Lock {}

      let injector = ReflectiveInjector.resolveAndCreate([Door, Lock]);
      let door = injector.get(Door);
      expect(door instanceof Door).toBeTruthy();
      expect(door.lock instanceof Lock).toBeTruthy();
      // #enddocregion
    });

    it('can be unwrapped', () => {
      // #docregion resolve_forward_ref
      let ref = forwardRef(() => 'refValue');
      expect(resolveForwardRef(ref)).toEqual('refValue');
      expect(resolveForwardRef('regularValue')).toEqual('regularValue');
      // #enddocregion
    });
  });
}
