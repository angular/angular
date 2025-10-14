/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Pipe} from '@angular/core';
let TodosFilter = class TodosFilter {
  transform(todos, filter) {
    return (todos || []).filter((t) => {
      if (filter === 'all' /* TodoFilter.All */) {
        return true;
      }
      if (filter === 'active' /* TodoFilter.Active */ && !t.completed) {
        return true;
      }
      if (filter === 'completed' /* TodoFilter.Completed */ && t.completed) {
        return true;
      }
      return false;
    });
  }
};
TodosFilter = __decorate(
  [
    Pipe({
      pure: false,
      name: 'todosFilter',
    }),
  ],
  TodosFilter,
);
export {TodosFilter};
//# sourceMappingURL=todos.pipe.js.map
