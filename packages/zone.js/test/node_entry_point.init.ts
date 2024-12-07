/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import './test-env-setup-jasmine';
import './wtf_mock';

import {patchJasmine} from '../lib/jasmine/jasmine';
import {rollupMain} from '../lib/node/main';
import {patchRxJs} from '../lib/rxjs/rxjs';
import {patchRxJsFakeAsync} from '../lib/rxjs/rxjs-fake-async';
import {rollupTesting} from '../lib/testing/zone-testing';
import {patchTaskTracking} from '../lib/zone-spec/task-tracking';
import {patchWtf} from '../lib/zone-spec/wtf';

import {setupNodeEnv} from './node-env-setup';
import {setupFakePolyfill} from './test_fake_polyfill';

// Must be loaded before zone loads, so that zone can detect WTF.
setupNodeEnv();
setupFakePolyfill();

// Setup tests for Zone without microtask support
const Zone = rollupMain();

// Zone symbol prefix is set to '__zone_symbol2__' in node-env-setup.ts.
rollupTesting(Zone);
patchTaskTracking(Zone);
patchWtf(Zone);
patchRxJs(Zone);
patchRxJsFakeAsync(Zone);
patchJasmine(Zone);
