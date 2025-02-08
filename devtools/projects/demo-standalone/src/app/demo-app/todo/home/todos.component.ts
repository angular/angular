/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgForOf} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {RouterLink} from '@angular/router';

import {SamplePipe} from './sample.pipe';
import {Todo, TodoComponent} from './todo.component';
import {TooltipDirective} from './tooltip.directive';

export const enum TodoFilter {
  All = 'all',
  Completed = 'completed',
  Active = 'active',
}

@Pipe({pure: false, name: 'todosFilter'})
export class TodosFilter implements PipeTransform {
  transform(todos: Todo[], filter: TodoFilter): Todo[] {
    return (todos || []).filter((t) => {
      if (filter === TodoFilter.All) {
        return true;
      }
      if (filter === TodoFilter.Active && !t.completed) {
        return true;
      }
      if (filter === TodoFilter.Completed && t.completed) {
        return true;
      }
      return false;
    });
  }
}

const fib = (n: number): number => {
  if (n === 1 || n === 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
};

@Component({
  selector: 'app-todos',
  imports: [RouterLink, TodoComponent, SamplePipe, TodosFilter, TooltipDirective],
  template: `
    <a [routerLink]="">Home</a>
    <a [routerLink]="">Home</a>
    <a [routerLink]="">Home</a>
    <p>{{ 'Sample text processed by a pipe' | sample }}</p>
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          (keydown.enter)="addTodo(input)"
          #input
          class="new-todo"
          placeholder="What needs to be done?"
          autofocus
        />
      </header>
      <section class="main">
        <input id="toggle-all" class="toggle-all" type="checkbox" />
        <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list">
          @for (todo of todos | todosFilter: filterValue; track todo) {
          <app-todo
            appTooltip
            [todo]="todo"
            (delete)="onDelete($event)"
            (update)="onChange($event)"
          />
          }
        </ul>
      </section>
      <footer class="footer">
        <span class="todo-count">
          <strong>{{ itemsLeft }}</strong> item left
        </span>
        <button class="clear-completed" (click)="clearCompleted()">Clear completed</button>
      </footer>
    </section>
  `,
})
export class TodosComponent implements OnInit, OnDestroy {
  todos: Todo[] = [
    {
      label: 'Buy milk',
      completed: false,
      id: '42',
    },
    {
      label: 'Build something fun!',
      completed: false,
      id: '43',
    },
  ];

  @Output() update = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() add = new EventEmitter();

  private hashListener!: EventListenerOrEventListenerObject;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', (this.hashListener = () => this.cdRef.markForCheck()));
    }
  }

  ngOnDestroy(): void {
    fib(40);
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', this.hashListener);
    }
  }

  get filterValue(): TodoFilter {
    if (typeof window !== 'undefined') {
      return (window.location.hash.replace(/^#\//, '') as TodoFilter) || TodoFilter.All;
    }
    return TodoFilter.All;
  }

  get itemsLeft(): number {
    return (this.todos || []).filter((t) => !t.completed).length;
  }

  clearCompleted(): void {
    (this.todos || []).filter((t) => t.completed).forEach((t) => this.delete.emit(t));
  }

  addTodo(input: HTMLInputElement): void {
    const todo = {
      completed: false,
      label: input.value,
    };
    const result: Todo = {...todo, id: Math.random().toString()};
    this.todos.push(result);
    input.value = '';
  }

  onChange(todo: Todo): void {
    if (!todo.id) {
      return;
    }
  }

  onDelete(todo: Todo): void {
    if (!todo.id) {
      return;
    }
    const idx = this.todos.findIndex((t) => t.id === todo.id);
    if (idx < 0) {
      return;
    }
    // tslint:disable-next-line:no-console
    console.log('Deleting', idx);

    this.todos.splice(idx, 1);
  }
}
