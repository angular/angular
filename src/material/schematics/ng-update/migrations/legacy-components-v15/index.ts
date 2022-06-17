/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, TargetVersion} from '@angular/cdk/schematics';

export class LegacyComponentsMigration extends Migration<null> {
  enabled = this.targetVersion === TargetVersion.V15;
}
