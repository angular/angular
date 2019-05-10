/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ProgressBarE2E} from './progress-bar-e2e';

@NgModule({
  imports: [MatProgressBarModule],
  declarations: [ProgressBarE2E],
})
export class ProgressBarE2eModule {
}
