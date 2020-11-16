/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';
import * as fs from 'fs';
import * as path from 'path';

const UTF8 = {
  encoding: 'utf-8'
};
const PACKAGE = 'angular/packages/core/test/bundling/router';

describe('treeshaking with uglify', () => {
  let content: string;
  // We use the debug version as otherwise symbols/identifiers would be mangled (and the test would
  // always pass)
  const contentPath = require.resolve(path.join(PACKAGE, 'bundle.min_debug.js'));
  beforeAll(() => {
    content = fs.readFileSync(contentPath, UTF8);
  });

  it('should drop unused TypeScript helpers', () => {
    expect(content).not.toContain('__asyncGenerator');
  });

  it('should not contain rxjs from commonjs distro', () => {
    expect(content).not.toContain('commonjsGlobal');
    expect(content).not.toContain('createCommonjsModule');
  });
});
