import 'zone.js';
import {Component, inject} from '@angular/core';
import {TodoService, Todo} from './todos';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  readonly zonelessInSearchParams = new URL(location.href).searchParams.get('zoneless') === 'true';
  private readonly createdInAngularZone = Zone.current.name === 'angular';
  readonly zonelessError = this.createdInAngularZone && this.zonelessInSearchParams;

  todos: Todo[] = [];
  remainingTodos = 0;
  isLoading: boolean = false;
  errorMessage?: string;

  private readonly todoService: TodoService = inject(TodoService);

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
    this.todos.unshift(newTodo);
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
    this.remainingTodos = this.todos.filter((todo) => !todo.completed).length;
  }

  toggleZoneless() {
    const url = new URL(location.href);
    url.searchParams.set('zoneless', `${!this.zonelessInSearchParams}`);
    location.href = url.toString();
  }
}
