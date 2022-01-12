/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatPseudoCheckbox} from './pseudo-checkbox';
import {MatCommonModule} from '../../common-behaviors/common-module';

@NgModule({
  imports: [MatCommonModule],
  exports: [MatPseudoCheckbox],
  declarations: [MatPseudoCheckbox],
})
export class MatPseudoCheckboxModule {}
