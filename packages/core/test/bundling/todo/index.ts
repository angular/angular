/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'reflect-metadata';

import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {Component, Injectable, IterableDiffers, NgModule, defineInjector, ɵNgOnChangesFeature as NgOnChangesFeature, ɵdefineDirective as defineDirective, ɵdirectiveInject as directiveInject, ɵinjectTemplateRef as injectTemplateRef, ɵinjectViewContainerRef as injectViewContainerRef, ɵrenderComponent as renderComponent} from '@angular/core';

export class Todo {
  editing: boolean;

  private _title: string;
  get title() { return this._title; }
  set title(value: string) { this._title = value.trim(); }

  constructor(title: string, public completed: boolean = false) {
    this.editing = false;
    this.title = title;
  }
}

@Injectable({providedIn: 'root'})
export class TodoStore {
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

  allCompleted() { return this.todos.length === this.getCompleted().length; }

  setAllTo(completed: boolean) { this.todos.forEach((t: Todo) => t.completed = completed); }

  removeCompleted() { this.todos = this.getWithCompleted(false); }

  getRemaining() { return this.getWithCompleted(false); }

  getCompleted() { return this.getWithCompleted(true); }

  toggleCompletion(todo: Todo) { todo.completed = !todo.completed; }

  remove(todo: Todo) { this.todos.splice(this.todos.indexOf(todo), 1); }

  add(title: string) { this.todos.push(new Todo(title)); }
}

@Component({
  selector: 'todo-app',
  // TODO(misko): make this work with `[(ngModel)]`
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
export class ToDoAppComponent {
  newTodoText = '';

  constructor(public todoStore: TodoStore) {}

  stopEditing(todo: Todo, editedTitle: string) {
    todo.title = editedTitle;
    todo.editing = false;
  }

  cancelEditingTodo(todo: Todo) { todo.editing = false; }

  updateEditingTodo(todo: Todo, editedTitle: string) {
    editedTitle = editedTitle.trim();
    todo.editing = false;

    if (editedTitle.length === 0) {
      return this.todoStore.remove(todo);
    }

    todo.title = editedTitle;
  }

  editTodo(todo: Todo) { todo.editing = true; }

  removeCompleted() { this.todoStore.removeCompleted(); }

  toggleCompletion(todo: Todo) { this.todoStore.toggleCompletion(todo); }

  remove(todo: Todo) { this.todoStore.remove(todo); }

  addTodo() {
    if (this.newTodoText.trim().length) {
      this.todoStore.add(this.newTodoText);
      this.newTodoText = '';
    }
  }
}

// In JIT mode the @Directive decorators in //packages/common will compile the Ivy fields. When
// running under --define=compile=legacy, //packages/common is not compiled with Ivy fields, so they
// must be monkey-patched on.
if (!(NgIf as any).ngDirectiveDef) {
  // TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
  (CommonModule as any).ngInjectorDef = defineInjector({factory: () => new CommonModule});

  // TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
  (NgForOf as any).ngDirectiveDef = defineDirective({
    type: NgForOf,
    selectors: [['', 'ngFor', '', 'ngForOf', '']],
    factory: () => new NgForOf(
                 injectViewContainerRef(), injectTemplateRef(), directiveInject(IterableDiffers)),
    features: [NgOnChangesFeature({
      ngForOf: 'ngForOf',
      ngForTrackBy: 'ngForTrackBy',
      ngForTemplate: 'ngForTemplate',
    })],
    inputs: {
      ngForOf: 'ngForOf',
      ngForTrackBy: 'ngForTrackBy',
      ngForTemplate: 'ngForTemplate',
    }
  });

  // TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
  (NgIf as any).ngDirectiveDef = defineDirective({
    type: NgIf,
    selectors: [['', 'ngIf', '']],
    factory: () => new NgIf(injectViewContainerRef(), injectTemplateRef()),
    inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
  });
}

@NgModule({declarations: [ToDoAppComponent, ToDoAppComponent], imports: [CommonModule]})
export class ToDoAppModule {
}

// TODO(misko): create cleaner way to publish component into global location for tests.
(window as any).toDoAppComponent = renderComponent(ToDoAppComponent);
