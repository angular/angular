/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';
import {INJECTOR, ScopedService} from './usage';


describe('functional test for injection system bundling', () => {
  it('should be able to inject the scoped service', () => {
    expect(INJECTOR.get(ScopedService) instanceof ScopedService).toBe(true);
  });
});
