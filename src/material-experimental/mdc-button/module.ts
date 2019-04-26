/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatAnchor, MatButton} from './button';
import {MatFabAnchor, MatFabButton} from './fab';
import {MatIconAnchor, MatIconButton} from './icon-button';

@NgModule({
  imports: [MatCommonModule, CommonModule],
  exports: [
    MatAnchor,
    MatButton,
    MatIconAnchor,
    MatIconButton,
    MatFabAnchor,
    MatFabButton,
    MatCommonModule,
  ],
  declarations: [
    MatAnchor,
    MatButton,
    MatIconAnchor,
    MatIconButton,
    MatFabAnchor,
    MatFabButton,
  ],
})
export class MatButtonModule {
}
