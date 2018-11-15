/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {MatExpansionModule} from '@angular/material';
import {NgModule} from '@angular/core';

import {ExampleList} from './example-list';
import {Example} from './example';

@NgModule({
  imports: [MatExpansionModule, CommonModule],
  declarations: [Example, ExampleList],
  exports: [Example, ExampleList]
})
export class ExamplePageModule {}
