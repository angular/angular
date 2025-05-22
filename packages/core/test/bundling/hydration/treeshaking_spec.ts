/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/compiler';

import * as fs from 'fs';
import * as path from 'path';

const PACKAGE = 'angular/';

describe('treeshaking with uglify', () => {
  let content: string;
  const contentPath = path.resolve('packages/core/test/bundling/hydration/bundles/main.js');
  beforeAll(() => {
    content = fs.readFileSync(contentPath, {encoding: 'utf-8'});
  });

  it('should not contain rxjs from commonjs distro', () => {
    expect(content).not.toContain('commonjsGlobal');
    expect(content).not.toContain('createCommonjsModule');
  });
});
