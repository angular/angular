import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Todo } from '../../models/todo';

@Component({
  templateUrl: 'todo.component.html',
  selector: 'app-todo',
  styles: [
    `
      .destroy {
        cursor: pointer;
      }
    `,
  ],
})
export class TodoComponent {
  @Input() todo: Todo;
  @Output() update = new EventEmitter();
  @Output() delete = new EventEmitter();

  editMode = false;

  toggle() {
    this.todo.completed = !this.todo.completed;
    this.update.emit(this.todo);
  }

  completeEdit(label: string) {
    this.todo.label = label;
    this.editMode = false;
    this.update.emit(this.todo);
  }

  enableEditMode() {
    this.editMode = true;
  }
}
