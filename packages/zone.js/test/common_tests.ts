/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import './common/microtasks.spec';
import './common/zone.spec';
import './common/task.spec';
import './common/util.spec';
import './common/Promise.spec';
import './common/queue-microtask.spec';
import './common/fetch.spec';
import './common/Error.spec';
import './common/setInterval.spec';
import './common/setTimeout.spec';
import './common/toString.spec';
import './zone-spec/long-stack-trace-zone.spec';
import './zone-spec/async-test.spec';
import './zone-spec/sync-test.spec';
import './zone-spec/fake-async-test.spec';
import './zone-spec/proxy.spec';
import './zone-spec/task-tracking.spec';
// TODO: Reenable this set of tests after sorting through errors.
// Content: Previously, all import paths that contained the string `rxjs` were marked as external
// causing these test to never actually run. As part of our migration we are "recreating" this
// by skipping this import.
// import './rxjs/rxjs.spec';

Error.stackTraceLimit = Number.POSITIVE_INFINITY;
