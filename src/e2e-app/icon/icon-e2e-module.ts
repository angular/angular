/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {IconE2E} from './icon-e2e';

@NgModule({
  imports: [MatIconModule],
  declarations: [IconE2E],
})
export class IconE2eModule {
}
