/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {patchJasmine} from '../jasmine/jasmine';
import {patchJest} from '../jest/jest';
import {patchMocha} from '../mocha/mocha';
import {ZoneType} from '../zone-impl';
import {patchAsyncTest} from '../zone-spec/async-test';
import {patchFakeAsyncTest} from '../zone-spec/fake-async-test';
import {patchLongStackTrace} from '../zone-spec/long-stack-trace';
import {patchProxyZoneSpec} from '../zone-spec/proxy';
import {patchSyncTest} from '../zone-spec/sync-test';

import {patchPromiseTesting} from './promise-testing';

export function rollupTesting(Zone: ZoneType): void {
  patchLongStackTrace(Zone);
  patchProxyZoneSpec(Zone);
  patchSyncTest(Zone);
  patchJasmine(Zone);
  patchJest(Zone);
  patchMocha(Zone);
  patchAsyncTest(Zone);
  patchFakeAsyncTest(Zone);
  patchPromiseTesting(Zone);
}
