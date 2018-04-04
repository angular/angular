/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {withBody} from '@angular/core/testing';
import * as fs from 'fs';
import * as path from 'path';

const UTF8 = {
  encoding: 'utf-8'
};
const PACKAGE = 'angular/packages/core/test/bundling/todo';
const BUNDLES = ['bundle.js', 'bundle.min_debug.js', 'bundle.min.js'];

describe('functional test for todo', () => {
  BUNDLES.forEach(bundle => {
    describe(bundle, () => {
      it('should render todo', withBody('<todo-app></todo-app>', () => {
           require(path.join(PACKAGE, bundle));
           expect(document.body.textContent).toContain('ToDo Application');
           expect(document.body.textContent).toContain('count: 5.');
           expect(document.body.textContent).toContain('Demonstrate Components');
         }));
    });
  });
});
