/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '@angular/core';
import {forwardRef, resolveForwardRef} from '@angular/core/src/di';

describe('forwardRef', () => {
  it('should wrap and unwrap the reference', () => {
    const ref = forwardRef(() => String);
    expect(ref instanceof Type).toBe(true);
    expect(resolveForwardRef(ref)).toBe(String);
  });
});
