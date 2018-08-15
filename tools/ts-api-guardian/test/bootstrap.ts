/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);

// Change directories to the path of the ts-api-guardian source tree. We need to resolve an actual
// path of a tree because we want to determine the path to the directory that includes all
// test fixture runfiles. On Windows this is usually the original non-sandboxed disk location,
// otherwise this just refers to the runfile directory with all the proper symlinked files.
// NB: we resolve `test/fixtures/empty.ts` and then step up 3 folders so to ensure we resolve to the
//     root of the source tree and not the output tree on Windows where there are no runfiles.
// TODO: remove the whole bootstrap file once the tests are Bazel and Windows compatible.
process.chdir(path.resolve(
    runfiles.resolve('angular/tools/ts-api-guardian/test/fixtures/empty.ts'), '../../..'));
