/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/core/test/bundling/util/src/reflect_metadata';

import {CommonModule} from '@angular/common';
import {Component, Injectable, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

class Todo {
  editing: boolean;

  // TODO(issue/24571): remove '!'.
  private _title!: string;
  get title() {
    return this._title;
  }
  set title(value: string) {
    this._title = value.trim();
  }

  constructor(title: string, public completed: boolean = false) {
    this.editing = false;
    this.title = title;
  }
}

@Injectable({providedIn: 'root'})
class TodoStore {
  todos: Array<Todo> = [
    new Todo('Demonstrate Components'),
    new Todo('Demonstrate Structural Directives', true),
    new Todo('Demonstrate NgModules'),
    new Todo('Demonstrate zoneless change detection'),
    new Todo('Demonstrate internationalization'),
  ];

  private getWithCompleted(completed: boolean) {
    return this.todos.filter((todo: Todo) => todo.completed === completed);
  }

  allCompleted() {
    return this.todos.length === this.getCompleted().length;
  }

  setAllTo(completed: boolean) {
    this.todos.forEach((t: Todo) => t.completed = completed);
  }

  removeCompleted() {
    this.todos = this.getWithCompleted(false);
  }

  getRemaining() {
    return this.getWithCompleted(false);
  }

  getCompleted() {
    return this.getWithCompleted(true);
  }

  toggleCompletion(todo: Todo) {
    todo.completed = !todo.completed;
  }

  remove(todo: Todo) {
    this.todos.splice(this.todos.indexOf(todo), 1);
  }

  add(title: string) {
    this.todos.push(new Todo(title));
  }
}

@Component({
  selector: 'todo-app',
  // TODO(misko): make this work with `[(ngModel)]`
  styles: [`
    .todo-list li.completed label {
      color: #d9d9d9;
      text-decoration: line-through;
      font-weight:bold;
    }
  `],
  template: `
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input class="new-todo" placeholder="What needs to be done?" autofocus=""
             [value]="newTodoText"
             (keyup)="$event.code == 'Enter' ? addTodo() : newTodoText = $event.target.value">
    </header>
    <section *ngIf="todoStore.todos.length > 0" class="main">
      <input *ngIf="todoStore.todos.length"
             #toggleall class="toggle-all" type="checkbox"
             [checked]="todoStore.allCompleted()"
             (click)="todoStore.setAllTo(toggleall.checked)">
      <ul class="todo-list">
        <li *ngFor="let todo of todoStore.todos"
            [class.completed]="todo.completed"
            [class.editing]="todo.editing">
          <div class="view">
            <input class="toggle" type="checkbox"
                   (click)="toggleCompletion(todo)"
                   [checked]="todo.completed">
            <label (dblclick)="editTodo(todo)">{{todo.title}}</label>
            <button class="destroy" (click)="remove(todo)"></button>
          </div>
          <input *ngIf="todo.editing"
                 class="edit" #editedtodo
                 [value]="todo.title"
                 (blur)="stopEditing(todo, editedtodo.value)"
                 (keyup)="todo.title = $event.target.value"
                 (keyup)="$event.code == 'Enter' && updateEditingTodo(todo, editedtodo.value)"
                 (keyup)="$event.code == 'Escape' && cancelEditingTodo(todo)">
        </li>
      </ul>
    </section>
    <footer *ngIf="todoStore.todos.length > 0" class="footer">
      <span class="todo-count">
        <strong>{{todoStore.getRemaining().length}}</strong>
        {{todoStore.getRemaining().length == 1 ? 'item' : 'items'}} left
      </span>
      <button *ngIf="todoStore.getCompleted().length > 0"
              class="clear-completed"
              (click)="removeCompleted()">
        Clear completed
      </button>
    </footer>
  </section>
  `,
  // TODO(misko): switch over to OnPush
  // changeDetection: ChangeDetectionStrategy.OnPush
})
class ToDoAppComponent {
  newTodoText = '';

  constructor(public todoStore: TodoStore) {
    (window as any).toDoAppComponent = this;
  }

  stopEditing(todo: Todo, editedTitle: string) {
    todo.title = editedTitle;
    todo.editing = false;
  }

  cancelEditingTodo(todo: Todo) {
    todo.editing = false;
  }

  updateEditingTodo(todo: Todo, editedTitle: string) {
    editedTitle = editedTitle.trim();
    todo.editing = false;

    if (editedTitle.length === 0) {
      return this.todoStore.remove(todo);
    }

    todo.title = editedTitle;
  }

  editTodo(todo: Todo) {
    todo.editing = true;
  }

  removeCompleted() {
    this.todoStore.removeCompleted();
  }

  toggleCompletion(todo: Todo) {
    this.todoStore.toggleCompletion(todo);
  }

  remove(todo: Todo) {
    this.todoStore.remove(todo);
  }

  addTodo() {
    if (this.newTodoText.trim().length) {
      this.todoStore.add(this.newTodoText);
      this.newTodoText = '';
    }
  }
}

@NgModule({declarations: [ToDoAppComponent], imports: [CommonModule, BrowserModule]})
class ToDoAppModule {
  ngDoBootstrap(app: any) {
    app.bootstrap(ToDoAppComponent);
  }
}

function bootstrapApp() {
  return platformBrowser().bootstrapModule(ToDoAppModule, {ngZone: 'noop'});
}

(window as any).bootstrapApp = bootstrapApp;
