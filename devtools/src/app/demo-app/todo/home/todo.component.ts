/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

import {Todo} from './todo';
import {TooltipDirective} from './tooltip.directive';

@Component({
  templateUrl: 'todo.component.html',
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./todo.component.scss'],
  imports: [TooltipDirective],
})
export class TodoComponent {
  readonly todo = input.required<Todo>();
  readonly update = output<Todo>();
  readonly delete = output<Todo>();

  editMode = false;

  toggle(): void {
    this.todo().completed = !this.todo().completed;
    this.update.emit(this.todo());
  }

  completeEdit(label: string): void {
    this.todo().label = label;
    this.editMode = false;
    this.update.emit(this.todo());
  }

  enableEditMode(): void {
    this.editMode = true;
  }
}
