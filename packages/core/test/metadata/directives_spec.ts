/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';

describe('Component decorator', () => {
  it('should default changeDetection to OnPush', () => {
    const comp = new Component({});
    expect(comp.changeDetection).toBe(ChangeDetectionStrategy.OnPush);
  });
});
