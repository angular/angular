/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {ExampleModule as ExampleDataModule} from '@angular/material-examples';
import {Example} from './example';


import {ExampleList} from './example-list';

@NgModule({
  imports: [CommonModule, ExampleDataModule, MatExpansionModule],
  declarations: [Example, ExampleList],
  exports: [Example, ExampleList]
})
export class ExampleModule {
}
