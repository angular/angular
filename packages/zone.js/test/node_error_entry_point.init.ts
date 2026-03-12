/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import './test-env-setup-jasmine';
import './wtf_mock';

import {patchError} from '../lib/common/error-rewrite';
import {patchPromise} from '../lib/common/promise';
import {patchToString} from '../lib/common/to-string';
import {patchNode} from '../lib/node/node';
import {patchRxJs} from '../lib/rxjs/rxjs';
import {patchPromiseTesting} from '../lib/testing/promise-testing';
import {loadZone} from '../lib/zone';
import {patchAsyncTest} from '../lib/zone-spec/async-test';
import {patchFakeAsyncTest} from '../lib/zone-spec/fake-async-test';
import {patchLongStackTrace} from '../lib/zone-spec/long-stack-trace';
import {patchProxyZoneSpec} from '../lib/zone-spec/proxy';
import {patchSyncTest} from '../lib/zone-spec/sync-test';
import {patchTaskTracking} from '../lib/zone-spec/task-tracking';
import {patchWtf} from '../lib/zone-spec/wtf';

import {setupFakePolyfill} from './test_fake_polyfill';

// Must be loaded before zone loads, so that zone can detect WTF.
setupFakePolyfill();

// Setup tests for Zone without microtask support
const Zone = loadZone();
patchPromise(Zone);
patchToString(Zone);
patchError(Zone);
patchNode(Zone);
patchAsyncTest(Zone);
patchFakeAsyncTest(Zone);
patchLongStackTrace(Zone);
patchProxyZoneSpec(Zone);
patchSyncTest(Zone);
patchTaskTracking(Zone);
patchWtf(Zone);
patchRxJs(Zone);
patchPromiseTesting(Zone);
