/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {TooltipDirective} from './tooltip.directive';
let TodoComponent = class TodoComponent {
  constructor() {
    this.todo = input.required();
    this.update = output();
    this.delete = output();
    this.editMode = false;
  }
  toggle() {
    this.todo().completed = !this.todo().completed;
    this.update.emit(this.todo());
  }
  completeEdit(label) {
    this.todo().label = label;
    this.editMode = false;
    this.update.emit(this.todo());
  }
  enableEditMode() {
    this.editMode = true;
  }
};
TodoComponent = __decorate(
  [
    Component({
      templateUrl: 'todo.component.html',
      selector: 'app-todo',
      changeDetection: ChangeDetectionStrategy.OnPush,
      styleUrls: ['./todo.component.scss'],
      imports: [TooltipDirective],
    }),
  ],
  TodoComponent,
);
export {TodoComponent};
//# sourceMappingURL=todo.component.js.map
