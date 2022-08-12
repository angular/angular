/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatAnchor, MatButton} from './button';
import {MatFabAnchor, MatFabButton, MatMiniFabAnchor, MatMiniFabButton} from './fab';
import {MatIconAnchor, MatIconButton} from './icon-button';

@NgModule({
  imports: [MatCommonModule, MatRippleModule],
  exports: [
    MatAnchor,
    MatButton,
    MatIconAnchor,
    MatIconButton,
    MatMiniFabAnchor,
    MatMiniFabButton,
    MatFabAnchor,
    MatFabButton,
    MatCommonModule,
  ],
  declarations: [
    MatAnchor,
    MatButton,
    MatIconAnchor,
    MatMiniFabAnchor,
    MatMiniFabButton,
    MatIconButton,
    MatFabAnchor,
    MatFabButton,
  ],
})
export class MatButtonModule {}
