/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {TabsE2e} from './tabs-e2e';

@NgModule({
  imports: [MatTabsModule, MatFormFieldModule, MatInputModule],
  declarations: [TabsE2e],
})
export class TabsE2eModule {}
