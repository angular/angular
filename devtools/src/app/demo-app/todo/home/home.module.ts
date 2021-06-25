import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {SamplePipe} from './sample.pipe';
import {TodoComponent} from './todos/todo/todo.component';
import {TooltipDirective} from './todos/todo/tooltip.directive';
import {TodosComponent} from './todos/todos.component';
import {TodosFilter} from './todos/todos.pipe';

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
