/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fs} from '../test_helpers/get_compliance_tests';

import {generateGoldenPartial} from './generate_golden_partial';

const [testTsconfigPath, outputPath] = process.argv.slice(2);
generateGoldenPartial(fs.resolve(testTsconfigPath), fs.resolve(outputPath));
