import {Component, inject, signal, computed} from '@angular/core';
import {TodoService, Todo} from './todos';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  todos = signal<Todo[]>([]);
  remainingTodos = computed(() => this.todos().filter((todo) => !todo.completed).length);
  isLoading = signal(false);

  private readonly todoService: TodoService = inject(TodoService);

  constructor() {
    this.loadTodos();
  }

  async loadTodos(): Promise<void> {
    this.isLoading.set(true);
    this.todos.set(await this.todoService.getTodos());
    this.isLoading.set(false);
  }

  async addTodo(text: string): Promise<void> {
    text = text.trim();
    if (!text) {
      return;
    }

    this.isLoading.set(true);
    const newTodo = await this.todoService.addTodo(text);
    this.todos.update((todos) => [...todos, newTodo]);
    this.isLoading.set(false);
  }

  async toggleComplete(todo: Todo): Promise<void> {
    this.isLoading.set(true);
    const updatedTodo = await this.todoService.toggleTodoComplete(todo);
    const index = this.todos().findIndex((t) => t.id === updatedTodo.id);
    if (index !== -1) {
      this.todos.update((todos) => {
        todos[index] = updatedTodo;
        return [...todos];
      });
    }
    this.isLoading.set(false);
  }

  async removeTodo(todoToRemove: Todo): Promise<void> {
    this.isLoading.set(true);
    const success = await this.todoService.removeTodo(todoToRemove.id);
    if (success) {
      this.todos.update((todos) => todos.filter((todo) => todo.id !== todoToRemove.id));
    }
    this.isLoading.set(false);
  }
}
