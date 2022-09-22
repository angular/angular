/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatRadioModule} from '@angular/material/radio';
import {RadioE2e} from './radio-e2e';

@NgModule({
  imports: [MatRadioModule],
  declarations: [RadioE2e],
})
export class RadioE2eModule {}
