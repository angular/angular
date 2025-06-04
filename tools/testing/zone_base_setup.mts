/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'reflect-metadata';

import {} from 'zone.js';

import {patchLongStackTrace} from 'zone.js/lib/zone-spec/long-stack-trace';
import {patchTaskTracking} from 'zone.js/lib/zone-spec/task-tracking';
import {patchProxyZoneSpec} from 'zone.js/lib/zone-spec/proxy';
import {patchSyncTest} from 'zone.js/lib/zone-spec/sync-test';
import {patchAsyncTest} from 'zone.js/lib/zone-spec/async-test';
import {patchFakeAsyncTest} from 'zone.js/lib/zone-spec/fake-async-test';
import {patchJasmine} from 'zone.js/lib/jasmine/jasmine';

patchLongStackTrace(Zone);
patchTaskTracking(Zone);
patchProxyZoneSpec(Zone);
patchSyncTest(Zone);
patchAsyncTest(Zone);
patchFakeAsyncTest(Zone);
patchJasmine(Zone);
