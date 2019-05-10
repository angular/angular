/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ProgressSpinnerE2E} from './progress-spinner-e2e';

@NgModule({
  imports: [MatProgressSpinnerModule],
  declarations: [ProgressSpinnerE2E],
})
export class ProgressSpinnerE2eModule {
}
