/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

import {TooltipDirective} from './tooltip.directive';

export interface Todo {
  id: string;
  completed: boolean;
  label: string;
}

@Component({
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective],
  styles: [
    `
      .destroy {
        cursor: pointer;
        display: unset !important;
      }
    `,
  ],
  template: `
    <li [class.completed]="todo.completed">
      <div class="view" appTooltip>
        <input class="toggle" type="checkbox" [checked]="todo.completed" (change)="toggle()" />
        <label (dblclick)="enableEditMode()" [style.display]="editMode ? 'none' : 'block'">{{
          todo.label
        }}</label>
        <button class="destroy" (click)="delete.emit(todo)"></button>
      </div>
      <input
        class="edit"
        [value]="todo.label"
        [style.display]="editMode ? 'block' : 'none'"
        (keydown.enter)="completeEdit($any($event.target).value)"
      />
    </li>
  `,
})
export class TodoComponent {
  @Input() todo!: Todo;
  @Output() update = new EventEmitter();
  @Output() delete = new EventEmitter();

  editMode = false;

  toggle(): void {
    this.todo.completed = !this.todo.completed;
    this.update.emit(this.todo);
  }

  completeEdit(label: string): void {
    this.todo.label = label;
    this.editMode = false;
    this.update.emit(this.todo);
  }

  enableEditMode(): void {
    this.editMode = true;
  }
}
