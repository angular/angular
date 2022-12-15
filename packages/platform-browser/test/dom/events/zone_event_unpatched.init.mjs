/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// NOTE: This file affects most of tests in `platform-browser/test`. Make sure to
// not change semantics of Angular that would result in false-positives. If you need
// to change semantics of Angular, please create a separate test BUILD target.

// This file marks the `unpatchedEventManagerTest` event as unpatched. This is not
// strictly needed, but done for a specific test verifying that unpatched events are
// running outside the zone. See `event_manager_spec.ts` and the
// `unpatchedEvents handler outside of ngZone` spec.

export function configureZoneUnpatchedEvent() {
  window.__zone_symbol__UNPATCHED_EVENTS = ['unpatchedEventManagerTest'];
}

// Invoke the function as a side-effect. We still expose the function so that it could be
// used e.g. in the Saucelabs legacy-job `test-init.ts` file.
configureZoneUnpatchedEvent();
