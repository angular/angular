import {Injectable, inject, InjectionToken} from '@angular/core';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const SIMULATION_DELAY = new InjectionToken<number>('simulation API delay', {
  providedIn: 'root',
  factory: () => 500,
});

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private todos: Todo[] = [
    {id: 1, text: 'Learn Angular services with Promises', completed: true},
    {id: 2, text: 'Simulate API calls with setTimeout', completed: false},
    {id: 3, text: 'Use async/await in components', completed: false},
  ];
  private nextId: number = 4;
  private readonly simulationDelay: number = inject(SIMULATION_DELAY);

  getTodos(): Promise<Todo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.todos]);
      }, this.simulationDelay);
    });
  }

  addTodo(text: string): Promise<Todo> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTodo: Todo = {
          id: this.nextId++,
          text: text,
          completed: false,
        };
        this.todos.unshift(newTodo);
        resolve({...newTodo});
      }, this.simulationDelay);
    });
  }

  toggleTodoComplete(todoToUpdate: Todo): Promise<Todo> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundTodo = this.todos.find((todo) => todo.id === todoToUpdate.id);
        if (foundTodo) {
          foundTodo.completed = !foundTodo.completed;
          resolve({...foundTodo});
        } else {
          resolve(todoToUpdate);
        }
      }, this.simulationDelay);
    });
  }

  removeTodo(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = this.todos.length;
        this.todos = this.todos.filter((todo) => todo.id !== id);
        const success = this.todos.length < initialLength;
        resolve(success);
      }, this.simulationDelay);
    });
  }
}
