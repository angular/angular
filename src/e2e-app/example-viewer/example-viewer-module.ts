/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ExampleModule as ExampleDataModule} from '@angular/material-examples';
import {ExampleListViewer} from './example-list-viewer.component';
import {ExampleViewer} from './example-viewer';

@NgModule({
  imports: [CommonModule, ExampleDataModule],
  declarations: [ExampleViewer, ExampleListViewer],
  exports: [ExampleViewer, ExampleListViewer]
})
export class ExampleViewerModule {
}
