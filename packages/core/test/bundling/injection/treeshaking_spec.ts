/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import {INJECTOR, ScopedService} from './usage';

const UTF8 = {
  encoding: 'utf-8'
};
const PACKAGE = 'angular/packages/core/test/bundling/hello_world';

describe('functional test for injection system bundling', () => {
  it('should be able to inject the scoped service',
     () => { expect(INJECTOR.get(ScopedService) instanceof ScopedService).toBe(true); });
});
