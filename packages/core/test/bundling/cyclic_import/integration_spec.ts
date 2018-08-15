/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';
import {withBody} from '@angular/private/testing';
import * as fs from 'fs';
import * as path from 'path';

const UTF8 = {
  encoding: 'utf-8'
};
const PACKAGE = 'angular/packages/core/test/bundling/cyclic_import';

describe('treeshaking with uglify', () => {
  let content: string;
  const contentPath = require.resolve(path.join(PACKAGE, 'bundle.min_debug.js'));
  beforeAll(() => {
    content = fs.readFileSync(contentPath, UTF8);
  });

  describe('functional test in domino', () => {
    it('should render hello world when not minified', withBody('<trigger></trigger>', () => {
         require(path.join(PACKAGE, 'bundle.js'));
         expect(document.body.textContent).toEqual('dep');
       }));

    it('should render hello world when debug minified', withBody('<trigger></trigger>', () => {
         require(path.join(PACKAGE, 'bundle.min_debug.js'));
         expect(document.body.textContent).toEqual('dep');
       }));

    it('should render hello world when fully minified', withBody('<trigger></trigger>', () => {
         require(path.join(PACKAGE, 'bundle.min.js'));
         expect(document.body.textContent).toEqual('dep');
       }));
  });
});
