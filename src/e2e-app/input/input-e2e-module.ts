/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {InputE2E} from './input-e2e';

@NgModule({
  imports: [MatFormFieldModule, MatInputModule],
  declarations: [InputE2E],
})
export class InputE2eModule {
}
