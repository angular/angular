/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy, OnInit } from '@angular/core';
import { Todo } from './todo';
import { TodoFilter } from './todos.pipe';
export declare class BaseCaseComponent {
}
export declare class RecursiveComponent {
    level: import("@angular/core").InputSignal<number>;
}
export declare class TodosComponent implements OnInit, OnDestroy {
    title: string;
    todos: Todo[];
    readonly update: import("@angular/core").OutputEmitterRef<Todo>;
    readonly delete: import("@angular/core").OutputEmitterRef<Todo>;
    readonly add: import("@angular/core").OutputEmitterRef<Todo>;
    private hashListener;
    private cdRef;
    ngOnInit(): void;
    ngOnDestroy(): void;
    get filterValue(): TodoFilter;
    get itemsLeft(): number;
    clearCompleted(): void;
    addTodo(input: HTMLInputElement): void;
    onChange(todo: Todo): void;
    onDelete(todo: Todo): void;
}
