/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';
import {ɵwhenRendered as whenRendered} from '@angular/core';
import {getComponent} from '@angular/core/src/render3';
import {withBody} from '@angular/private/testing';
import * as path from 'path';

const UTF8 = {
  encoding: 'utf-8'
};
const PACKAGE = 'angular/packages/core/test/bundling/todo';
const BUNDLES = ['bundle.js', 'bundle.min_debug.js', 'bundle.min.js'];

describe('functional test for todo', () => {
  BUNDLES.forEach(bundle => {
    describe(bundle, () => {
      it('should render todo', withBody('<todo-app></todo-app>', async () => {
           require(path.join(PACKAGE, bundle));
           const toDoAppComponent = getComponent(document.querySelector('todo-app')!);
           expect(document.body.textContent).toContain('todos');
           expect(document.body.textContent).toContain('Demonstrate Components');
           expect(document.body.textContent).toContain('4 items left');
           document.querySelector('button')!.click();
           await whenRendered(toDoAppComponent);
           expect(document.body.textContent).toContain('3 items left');
         }));
    });
  });
});
