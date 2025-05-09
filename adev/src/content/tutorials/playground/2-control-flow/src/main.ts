import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <h2>Todos</h2>
    <input #text />
    <button (click)="add(text.value)">Add</button>

    @for (todo of todos; track $index) {
    <p>
      <input type="checkbox" (change)="toggle($index)" />
      @if (todo.done) {
      <s>{{ todo.text }}</s>
      } @else {
      <span>{{ todo.text }}</span>
      }
    </p>
    } @empty {
    <p>No todos</p>
    }
  `,
})
export class Todos {
  todos: Array<{done: boolean; text: string}> = [];

  add(text: string) {
    this.todos.push({text, done: false});
  }

  toggle(index: number) {
    this.todos[index].done = !this.todos[index].done;
  }
}

bootstrapApplication(Todos);
