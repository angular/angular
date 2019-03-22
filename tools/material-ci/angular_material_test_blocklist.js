/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Blocklist of unit tests from angular/material2 with ivy that are skipped when running on
 * angular/angular. As bugs are resolved, items should be removed from this blocklist.
 *
 * The `notes` section should be used to keep track of specific issues associated with the failures.
 */

// clang-format off
// tslint:disable

window.testBlocklist = {
  "MatSidenav should be fixed position when in fixed mode": {
    "error": "Error: Expected ng-tns-c380-0 ng-trigger ng-trigger-transform mat-drawer mat-sidenav mat-drawer-over ng-star-inserted to contain 'mat-sidenav-fixed'.",
    "notes": "FW-1132: Host class bindings don't work if super class has host class bindings"
  },
  "MatSidenav should set fixed bottom and top when in fixed mode": {
    "error": "Error: Expected '' to be '20px'.",
    "notes": "FW-1132: Host class bindings don't work if super class has host class bindings"
  }
};
// clang-format on
