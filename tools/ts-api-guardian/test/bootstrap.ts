/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

// Resolve the path to the package.json of the ts-api-guardian. We need to resolve an actual
// path of a runfile because we want to determine the path to the directory that includes all
// test fixture runfiles. On Windows this is usually the original non-sandboxed disk location,
// otherwise this just refers to the runfile directory with all the proper symlinked files.
// TODO: remove the whole bootstrap file once the tests are Bazel and Windows compatible.
const runfilesDirectory = path.dirname(require.resolve('../package.json'));

process.chdir(runfilesDirectory);
