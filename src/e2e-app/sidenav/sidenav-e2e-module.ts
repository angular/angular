/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {SidenavE2E} from './sidenav-e2e';

@NgModule({
  imports: [MatSidenavModule],
  declarations: [SidenavE2E],
})
export class SidenavE2eModule {
}
