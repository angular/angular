/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';
import {withBody} from '@angular/private/testing';
import * as path from 'path';

const PACKAGE = 'angular/packages/core/test/bundling/todo';
const BUNDLES = ['bundle.js', 'bundle.min_debug.js', 'bundle.min.js'];

describe('functional test for todo', () => {
  BUNDLES.forEach(bundle => {
    describe(bundle, () => {
      it('should render todo', withBody('<todo-app></todo-app>', async () => {
           const {whenRendered} = require(path.join(PACKAGE, bundle));
           expect(document.body.textContent).toContain('todos');
           expect(document.body.textContent).toContain('Demonstrate Components');
           expect(document.body.textContent).toContain('4 items left');
           document.querySelector('button')!.click();
           await whenRendered((window as any).todoAppComponent);
           expect(document.body.textContent).toContain('3 items left');
         }));
    });
  });
});
