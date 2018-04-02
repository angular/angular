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

describe('functional test for todo', () => {
  it('should render todo when not minified', withBody('<todo-app></todo-app>', () => {
       require(path.join(PACKAGE, 'bundle.js'));
       expect(document.body.textContent).toContain('ToDo Application');
       expect(document.body.textContent).toContain('count: 5.');
       // TODO(misko): disabled until `ViewContainerRef` is  fixed
       // expect(document.body.textContent).toContain('Demonstrate Components');
     }));

  it('should render todo when debug minified', withBody('<todo-app></todo-app>', () => {
       require(path.join(PACKAGE, 'bundle.min_debug.js'));
       expect(document.body.textContent).toContain('ToDo Application');
       expect(document.body.textContent).toContain('count: 5.');
       // TODO(misko): disabled until `ViewContainerRef` is  fixed
       // expect(document.body.textContent).toContain('Demonstrate Components');
     }));

  it('should render todo when fully minified', withBody('<todo-app></todo-app>', () => {
       require(path.join(PACKAGE, 'bundle.min.js'));
       expect(document.body.textContent).toContain('ToDo Application');
       expect(document.body.textContent).toContain('count: 5.');
       // TODO(misko): disabled until `ViewContainerRef` is  fixed
       // expect(document.body.textContent).toContain('Demonstrate Components');
     }));
});
