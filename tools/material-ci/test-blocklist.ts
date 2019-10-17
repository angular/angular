/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// clang-format off
// tslint:disable

interface BlocklistEntry {
  /** Description on why the given test is disabled. */
  notes: string;
  /** Optional error that has been thrown in the test. */
  error?: string;
}

/**
 * List of tests that should not run in the Angular component test suites. This should
 * be empty in the components repository, but the file will be overwritten if the framework
 * repository runs the Angular component test suites against the latest snapshots. This is
 * helpful because sometimes breaking changes that break individual tests land in the framework
 * repository. It should be possible to disable these tests until the component repository
 * migrated the broken tests.
 */
export const testBlocklist: {[testName: string]: BlocklistEntry} = {};

// clang-format on
