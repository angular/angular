/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { PipeTransform } from '@angular/core';
import { Todo } from './todo';
export declare const enum TodoFilter {
    All = "all",
    Completed = "completed",
    Active = "active"
}
export declare class TodosFilter implements PipeTransform {
    transform(todos: Todo[], filter: TodoFilter): Todo[];
}
