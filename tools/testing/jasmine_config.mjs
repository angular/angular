/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Disable Jasmine's strict uniqueness requirement for suite and spec names.
if (typeof jasmine !== 'undefined') {
  jasmine.getEnv().configure({forbidDuplicateNames: false});
}
