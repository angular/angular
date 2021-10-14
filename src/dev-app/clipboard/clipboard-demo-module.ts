/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClipboardModule} from '@angular/cdk/clipboard';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ClipboardDemo} from './clipboard-demo';

@NgModule({
  imports: [
    ClipboardModule,
    FormsModule,
    RouterModule.forChild([{path: '', component: ClipboardDemo}]),
  ],
  declarations: [ClipboardDemo],
})
export class ClipboardDemoModule {}
