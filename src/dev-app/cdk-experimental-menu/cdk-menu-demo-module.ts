/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CdkMenuModule} from '@angular/cdk-experimental/menu';
import {CdkMenuExamplesModule} from '@angular/components-examples/cdk-experimental/menu';

import {CdkMenuDemo} from './cdk-menu-demo';

@NgModule({
  imports: [
    CdkMenuModule,
    CommonModule,
    CdkMenuExamplesModule,
    RouterModule.forChild([{path: '', component: CdkMenuDemo}]),
  ],
  declarations: [CdkMenuDemo],
})
export class CdkMenuDemoModule {}
