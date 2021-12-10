/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';

import {DevToolsTabModule} from './devtools-tabs/devtools-tabs.module';
import {DevToolsComponent} from './devtools.component';

@NgModule({
  declarations: [DevToolsComponent],
  imports: [CommonModule, DevToolsTabModule, MatProgressSpinnerModule, MatTooltipModule],
  exports: [DevToolsComponent],
})
export class DevToolsModule {
}
