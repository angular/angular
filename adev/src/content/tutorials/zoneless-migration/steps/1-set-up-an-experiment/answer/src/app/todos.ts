import {Injectable} from '@angular/core';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

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
  private simulationDelay = 500;

  getTodos(): Promise<Todo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.todos]); // Return a copy to prevent direct mutation from outside
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
        resolve({...newTodo}); // Return a copy
      }, this.simulationDelay);
    });
  }

  toggleTodoComplete(todoToUpdate: Todo): Promise<Todo> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundTodo = this.todos.find((todo) => todo.id === todoToUpdate.id);
        if (foundTodo) {
          foundTodo.completed = !foundTodo.completed;
          resolve({...foundTodo}); // Return a copy
        } else {
          resolve(todoToUpdate); // Or handle error appropriately
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
