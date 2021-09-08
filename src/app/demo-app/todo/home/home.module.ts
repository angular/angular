import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TodosComponent } from './todos.component';
import { TodoComponent } from './todo.component';
import { TodosFilter } from './todos.pipe';
import { TooltipDirective } from './/tooltip.directive';
import { CommonModule } from '@angular/common';
import { SamplePipe } from './sample.pipe';

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
export class HomeModule {}
