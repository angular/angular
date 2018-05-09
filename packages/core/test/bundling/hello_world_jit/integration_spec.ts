/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵivyEnabled as ivyEnabled} from '@angular/core';
import {withBody} from '@angular/core/testing';
import * as fs from 'fs';
import * as path from 'path';

const PACKAGE = 'angular/packages/core/test/bundling/hello_world_jit';

ivyEnabled && describe('Ivy JIT hello world', () => {
  it('should render hello world', withBody('<hello-world></hello-world>', () => {
       require(path.join(PACKAGE, 'bundle.js'));
       expect(document.body.textContent).toEqual('Hello World!');
     }));
});

xit('ensure at least one spec exists', () => {});
