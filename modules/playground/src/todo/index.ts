/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {Store, Todo, TodoFactory} from './app/TodoStore';

@Component({selector: 'todo-app', viewProviders: [Store, TodoFactory], templateUrl: 'todo.html'})
class TodoApp {
  todoEdit: Todo = null;

  constructor(public todoStore: Store<Todo>, public factory: TodoFactory) {}

  enterTodo(inputElement: any /** TODO #9100 */): void {
    this.addTodo(inputElement.value);
    inputElement.value = '';
  }

  editTodo(todo: Todo): void { this.todoEdit = todo; }

  doneEditing($event: any /** TODO #9100 */, todo: Todo): void {
    var which = $event.which;
    var target = $event.target;
    if (which === 13) {
      todo.title = target.value;
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      target.value = todo.title;
    }
  }

  addTodo(newTitle: string): void { this.todoStore.add(this.factory.create(newTitle, false)); }

  completeMe(todo: Todo): void { todo.completed = !todo.completed; }

  deleteMe(todo: Todo): void { this.todoStore.remove(todo); }

  toggleAll($event: any /** TODO #9100 */): void {
    var isComplete = $event.target.checked;
    this.todoStore.list.forEach((todo: Todo) => { todo.completed = isComplete; });
  }

  clearCompleted(): void { this.todoStore.removeBy((todo: Todo) => todo.completed); }
}

@NgModule({declarations: [TodoApp], bootstrap: [TodoApp], imports: [BrowserModule]})
class ExampleModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
