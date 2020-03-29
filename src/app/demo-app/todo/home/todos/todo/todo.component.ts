import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Todo } from '../../models/todo';

@Component({
  templateUrl: 'todo.component.html',
  selector: 'app-todo',
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
