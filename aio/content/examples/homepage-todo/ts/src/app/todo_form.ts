// #docregion
import { Component, Output, EventEmitter } from '@angular/core';
import { Todo } from './todo';

@Component({
  selector: 'todo-form',
  template: `
    <form (ngSubmit)="addTodo()">
      <input type="text" [(ngModel)]="task" size="30"
             placeholder="add new todo here">
      <input class="btn-primary" type="submit" value="add">
    </form>`
})
export class TodoFormComponent {
  @Output() newTask = new EventEmitter<Todo>();
  task: string = '';

  addTodo() {
    if (this.task) {
      this.newTask.emit({text: this.task, done: false});
    }
    this.task = '';
  }
}

