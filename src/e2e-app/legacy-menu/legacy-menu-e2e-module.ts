/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyMenuModule} from '@angular/material/legacy-menu';
import {LegacyMenuE2e} from './legacy-menu-e2e';

@NgModule({
  imports: [MatLegacyMenuModule],
  declarations: [LegacyMenuE2e],
})
export class LegacyMenuE2eModule {}
