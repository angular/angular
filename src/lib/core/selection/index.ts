/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatPseudoCheckbox} from './pseudo-checkbox/pseudo-checkbox';


@NgModule({
  exports: [MatPseudoCheckbox],
  declarations: [MatPseudoCheckbox]
})
export class MatPseudoCheckboxModule { }


export * from './pseudo-checkbox/pseudo-checkbox';
