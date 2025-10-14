/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectorRef, Component, inject, output, input} from '@angular/core';
import {TodosFilter} from './todos.pipe';
import {SamplePipe} from './sample.pipe';
import {TooltipDirective} from './tooltip.directive';
import {TodoComponent} from './todo.component';
import {RouterLink} from '@angular/router';
const fib = (n) => {
  if (n === 1 || n === 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
};
let BaseCaseComponent = class BaseCaseComponent {};
BaseCaseComponent = __decorate(
  [
    Component({
      selector: 'base-case',
      template: `
    <h2>Base Case</h2>
  `,
    }),
  ],
  BaseCaseComponent,
);
export {BaseCaseComponent};
let RecursiveComponent = class RecursiveComponent {
  constructor() {
    this.level = input(5);
  }
};
RecursiveComponent = __decorate(
  [
    Component({
      selector: 'recursive-component',
      imports: [BaseCaseComponent],
      template: `
    <div class="recursive-component">
      @if (level() === 0) {
        <base-case/>
      } @else {
        <h3>Level {{ level() }}</h3>
        <recursive-component [level]="level() - 1"/>
      }
    </div>
  `,
    }),
  ],
  RecursiveComponent,
);
export {RecursiveComponent};
let TodosComponent = class TodosComponent {
  constructor() {
    this.title = 'Angular Todo';
    this.todos = [
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
    this.update = output();
    this.delete = output();
    this.add = output();
    this.cdRef = inject(ChangeDetectorRef);
  }
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', (this.hashListener = () => this.cdRef.markForCheck()));
    }
  }
  ngOnDestroy() {
    fib(40);
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', this.hashListener);
    }
  }
  get filterValue() {
    if (typeof window !== 'undefined') {
      return window.location.hash.replace(/^#\//, '') || 'all' /* TodoFilter.All */;
    }
    return 'all' /* TodoFilter.All */;
  }
  get itemsLeft() {
    return (this.todos || []).filter((t) => !t.completed).length;
  }
  clearCompleted() {
    (this.todos || []).filter((t) => t.completed).forEach((t) => this.delete.emit(t));
  }
  addTodo(input) {
    const todo = {
      completed: false,
      label: input.value,
    };
    const result = {...todo, id: Math.random().toString()};
    this.todos.push(result);
    input.value = '';
  }
  onChange(todo) {
    if (!todo.id) {
      return;
    }
  }
  onDelete(todo) {
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
};
TodosComponent = __decorate(
  [
    Component({
      templateUrl: 'todos.component.html',
      selector: 'app-todos',
      imports: [
        RouterLink,
        TodoComponent,
        TooltipDirective,
        SamplePipe,
        TodosFilter,
        RecursiveComponent,
      ],
    }),
  ],
  TodosComponent,
);
export {TodosComponent};
//# sourceMappingURL=todos.component.js.map
