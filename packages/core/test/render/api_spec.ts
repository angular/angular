/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Renderer2} from '@angular/core';

// TODO (matsko): remove this file once 5.0.0beta.0 is in

export function main() {
  describe('Renderer2', () => {
    it('should have a private field that can be accessed temporarily', () => {
      // TODO (matsko): change this to false when PR #17528 has landed
      expect((Renderer2 as any)['__render_1_support_required']).toBe(true);
    });
  });
}
