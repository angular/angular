/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

import {Todo} from './todo';

@Component({
  templateUrl: 'todo.component.html',
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent {
  @Input() todo: Todo;
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
