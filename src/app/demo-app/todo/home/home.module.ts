import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TodosComponent } from './todos/todos.component';
import { TodoComponent } from './todos/todo/todo.component';
import { TodosFilter } from './todos/todos.pipe';
import { TooltipDirective } from './todos/todo/tooltip.directive';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, RouterModule.forChild([{
    path: '',
    component: TodosComponent,
    pathMatch: 'full'
  }])],
  declarations: [TodosComponent, TodoComponent, TodosFilter, TooltipDirective],
  exports: [TodosComponent]
})
export class HomeModule {}
