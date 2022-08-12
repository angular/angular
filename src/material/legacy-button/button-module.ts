/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatLegacyAnchor, MatLegacyButton} from './button';

@NgModule({
  imports: [MatRippleModule, MatCommonModule],
  exports: [MatLegacyButton, MatLegacyAnchor, MatCommonModule],
  declarations: [MatLegacyButton, MatLegacyAnchor],
})
export class MatLegacyButtonModule {}
