/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material';
import {IconDemo} from './icon-demo';

@NgModule({
  imports: [
    MatIconModule,
  ],
  declarations: [IconDemo],
})
export class IconDemoModule {
}
