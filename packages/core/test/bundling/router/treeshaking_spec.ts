/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';

import {runfiles} from '@bazel/runfiles';
import * as fs from 'fs';
import * as path from 'path';

const PACKAGE = 'angular/packages/core/test/bundling/router';

describe('treeshaking with uglify', () => {
  let content: string;
  // We use the debug version as otherwise symbols/identifiers would be mangled (and the test would
  // always pass)
  const contentPath = runfiles.resolve(path.join(PACKAGE, 'bundle.debug.min.js'));
  beforeAll(() => {
    content = fs.readFileSync(contentPath, {encoding: 'utf-8'});
  });

  it('should drop unused TypeScript helpers', () => {
    expect(content).not.toContain('__asyncGenerator');
  });

  it('should not contain rxjs from commonjs distro', () => {
    expect(content).not.toContain('commonjsGlobal');
    expect(content).not.toContain('createCommonjsModule');
  });
});
