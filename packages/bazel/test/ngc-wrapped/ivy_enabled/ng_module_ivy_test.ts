/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFileSync} from 'fs';

describe('ng_module with ivy enabled', () => {
  it('should generate definitions as with full compilation mode', () => {
    const outputFile = runfiles.resolveWorkspaceRelative(
        'packages/bazel/test/ngc-wrapped/ivy_enabled/test_module_default_compilation.mjs');
    const fileContent = readFileSync(outputFile, 'utf8');
    expect(fileContent).toContain(`static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent`);
  });
});
