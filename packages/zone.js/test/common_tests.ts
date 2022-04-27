/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './common/microtasks.spec.js';
import './common/zone.spec.js';
import './common/task.spec.js';
import './common/util.spec.js';
import './common/Promise.spec.js';
import './common/fetch.spec.js';
import './common/Error.spec.js';
import './common/setInterval.spec.js';
import './common/setTimeout.spec.js';
import './common/toString.spec.js';
import './zone-spec/long-stack-trace-zone.spec.js';
import './zone-spec/async-test.spec.js';
import './zone-spec/sync-test.spec.js';
import './zone-spec/fake-async-test.spec.js';
import './zone-spec/proxy.spec.js';
import './zone-spec/task-tracking.spec.js';
import './rxjs/rxjs.spec.js';

Error.stackTraceLimit = Number.POSITIVE_INFINITY;
