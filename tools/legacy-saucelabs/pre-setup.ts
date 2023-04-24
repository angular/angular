/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// ZoneJS configuration needed for some event manager tests. This config could
// affect all legacy tests but in reality is scoped to certain special tests.
import {configureZoneUnpatchedEvent} from '../../packages/platform-browser/test/dom/events/zone_event_unpatched.init.mjs';

// Increase the timeout for specs as Saucelabs devices can be slow.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

configureZoneUnpatchedEvent();
