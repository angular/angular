/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {Store, Todo, TodoFactory} from './app/TodoStore';

@Component({selector: 'todo-app', viewProviders: [Store, TodoFactory], templateUrl: 'todo.html'})
export class TodoApp {
  todoEdit: Todo = null;

  constructor(public todoStore: Store<Todo>, public factory: TodoFactory) {}

  enterTodo(inputElement: HTMLInputElement): void {
    this.addTodo(inputElement.value);
    inputElement.value = '';
  }

  editTodo(todo: Todo): void {
    this.todoEdit = todo;
  }

  doneEditing($event: KeyboardEvent, todo: Todo): void {
    const which = $event.which;
    const target = $event.target as HTMLInputElement;
    if (which === 13) {
      todo.title = target.value;
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      target.value = todo.title;
    }
  }

  addTodo(newTitle: string): void {
    this.todoStore.add(this.factory.create(newTitle, false));
  }

  completeMe(todo: Todo): void {
    todo.completed = !todo.completed;
  }

  deleteMe(todo: Todo): void {
    this.todoStore.remove(todo);
  }

  toggleAll($event: MouseEvent): void {
    const isComplete = ($event.target as HTMLInputElement).checked;
    this.todoStore.list.forEach((todo: Todo) => {
      todo.completed = isComplete;
    });
  }

  clearCompleted(): void {
    this.todoStore.removeBy((todo: Todo) => todo.completed);
  }
}

@NgModule({declarations: [TodoApp], bootstrap: [TodoApp], imports: [BrowserModule]})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
