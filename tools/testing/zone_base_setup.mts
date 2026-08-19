/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'reflect-metadata';

import 'zone.js/plugins/long-stack-trace-zone';
import 'zone.js/plugins/task-tracking';
import 'zone.js/plugins/proxy';
import 'zone.js/plugins/sync-test';
import 'zone.js/plugins/async-test';
import 'zone.js/plugins/fake-async-test';
import {patchJasmine} from '../../packages/zone.js/lib/jasmine/jasmine';

declare const Zone: import('../../packages/zone.js/lib/zone-impl').ZoneType;

patchJasmine(Zone);
