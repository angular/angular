/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
// Before running tests, change directories to our directory under the runfiles
// From runfiles we want to go to the angular/tools/ts-api-guardian subfolder.
process.chdir(path.join(process.env['TEST_SRCDIR'], 'angular', 'tools', 'ts-api-guardian'));
