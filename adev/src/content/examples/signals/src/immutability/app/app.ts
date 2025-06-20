import {Component, signal, computed} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-immutability',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormsModule],
})
export class Immutability {
  todos = signal<string[]>(['Learn Signals']);
  todoCount = computed(() => this.todos().length);
  newTodoText = signal('');

  addTodoCorrectly() {
    const newTodo = this.newTodoText().trim();
    if (!newTodo) return;

    this.todos.update((currentTodos) => [...currentTodos, newTodo]);
    this.newTodoText.set('');
  }

  addTodoIncorrectly() {
    const newTodo = this.newTodoText().trim();
    if (!newTodo) return;

    this.todos().push(newTodo);
    this.newTodoText.set('');
  }
}
