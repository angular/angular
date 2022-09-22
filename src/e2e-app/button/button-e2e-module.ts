/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ButtonE2e} from './button-e2e';

@NgModule({
  imports: [MatButtonModule, MatIconModule],
  declarations: [ButtonE2e],
})
export class ButtonE2eModule {}
