import {Component, inject, ChangeDetectorRef, signal} from '@angular/core';
import {TodoService, Todo} from './todos';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  todos: Todo[] = [];
  remainingTodos = 0;
  isLoading = false;

  private readonly todoService: TodoService = inject(TodoService);
  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    this.loadTodos();
  }

  async loadTodos(): Promise<void> {
    this.isLoading = true;
    this.todos = await this.todoService.getTodos();
    this.updateRemainingTodos();
    this.isLoading = false;
  }

  async addTodo(text: string): Promise<void> {
    text = text.trim();
    if (!text) {
      return;
    }

    this.isLoading = true;
    const newTodo = await this.todoService.addTodo(text);
    this.todos = [...this.todos, newTodo];
    this.updateRemainingTodos();
    this.isLoading = false;
  }

  async toggleComplete(todo: Todo): Promise<void> {
    this.isLoading = true;
    const updatedTodo = await this.todoService.toggleTodoComplete(todo);
    const index = this.todos.findIndex((t) => t.id === updatedTodo.id);
    if (index !== -1) {
      this.todos[index] = updatedTodo;
      this.updateRemainingTodos();
    }
    this.isLoading = false;
  }

  async removeTodo(todoToRemove: Todo): Promise<void> {
    this.isLoading = true;
    const success = await this.todoService.removeTodo(todoToRemove.id);
    if (success) {
      this.todos = this.todos.filter((todo) => todo.id !== todoToRemove.id);
      this.updateRemainingTodos();
    }
    this.isLoading = false;
  }

  private updateRemainingTodos() {
    const incompleteTodos = this.todos.filter((todo) => !todo.completed);
    this.remainingTodos = incompleteTodos.length;
  }
}
