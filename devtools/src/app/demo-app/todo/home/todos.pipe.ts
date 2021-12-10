/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';

import {Todo} from './todo';

export const enum TodoFilter {
  All = 'all',
  Completed = 'completed',
  Active = 'active',
}

@Pipe({
  pure: false,
  name: 'todosFilter',
})
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
