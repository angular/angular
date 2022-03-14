/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeMigrator} from '../../runtime-migrator';

export class ButtonRuntimeMigrator extends RuntimeMigrator {
  oldImportModule = '@angular/material/button';
  newImportModule = '@angular/material-experimental/mdc-button';
}
