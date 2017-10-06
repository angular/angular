/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatIcon} from './icon';
import {ICON_REGISTRY_PROVIDER} from './icon-registry';


@NgModule({
  imports: [MatCommonModule],
  exports: [MatIcon, MatCommonModule],
  declarations: [MatIcon],
  providers: [ICON_REGISTRY_PROVIDER],
})
export class MatIconModule {}
