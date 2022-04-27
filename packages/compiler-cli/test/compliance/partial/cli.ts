/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fs} from '../test_helpers/get_compliance_tests.js';

import {generateGoldenPartial} from './generate_golden_partial.js';

generateGoldenPartial(fs.resolve(process.argv[2]));
