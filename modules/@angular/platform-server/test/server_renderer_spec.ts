/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, it} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';
import {TEMPLATE_BINDINGS_EXP} from '../src/server_renderer';

export function main() {
  describe('ServerRenderer', () => {
    describe('setBindingDebugInfo', () => {
      describe('template binding regex', () => {
        it('should match the string containing Unicode char with code 8233', () => {
          // https://github.com/angular/angular/issues/14423
          const expression = `{"ng-reflect-ng-if": "${String.fromCharCode(8233)}"}`;
          const binding = `template bindings=${expression}`;
          const match = binding.match(TEMPLATE_BINDINGS_EXP);
          expect(match).not.toBeNull();
          expect(match.length).toBe(2);
          expect(match[1]).toEqual(expression);
        });
      });
    });
  });
}
