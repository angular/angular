/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {TooltipDirective} from './/tooltip.directive';
import {SamplePipe} from './sample.pipe';
import {TodoComponent} from './todo.component';
import {TodosComponent} from './todos.component';
import {TodosFilter} from './todos.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: TodosComponent,
        pathMatch: 'full',
      },
    ]),
  ],
  declarations: [SamplePipe, TodosComponent, TodoComponent, TodosFilter, TooltipDirective],
  exports: [TodosComponent],
})
export class HomeModule {
}
