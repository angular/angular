/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {SimpleCheckboxes} from './checkbox-e2e';

@NgModule({
  imports: [MatCheckboxModule],
  declarations: [SimpleCheckboxes],
})
export class CheckboxE2eModule {
}
