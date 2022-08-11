/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyListModule} from '@angular/material/legacy-list';
import {RouterModule} from '@angular/router';
import {E2eAppLayout, Home} from './e2e-app-layout';

@NgModule({
  imports: [CommonModule, MatLegacyListModule, RouterModule],
  declarations: [E2eAppLayout, Home],
  exports: [E2eAppLayout],
})
export class E2eAppModule {}
