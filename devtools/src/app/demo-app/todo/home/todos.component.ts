/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit, output} from '@angular/core';

import {Todo} from './todo';
import {TodoFilter, TodosFilter} from './todos.pipe';
import {SamplePipe} from './sample.pipe';
import {TooltipDirective} from './tooltip.directive';
import {TodoComponent} from './todo.component';
import {RouterLink} from '@angular/router';

const fib = (n: number): number => {
  if (n === 1 || n === 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
};

@Component({
  templateUrl: 'todos.component.html',
  selector: 'app-todos',
  imports: [RouterLink, TodoComponent, TooltipDirective, SamplePipe, TodosFilter],
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

  readonly update = output<Todo>();
  readonly delete = output<Todo>();
  readonly add = output<Todo>();

  private hashListener!: EventListenerOrEventListenerObject;
  private cdRef = inject(ChangeDetectorRef);

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
