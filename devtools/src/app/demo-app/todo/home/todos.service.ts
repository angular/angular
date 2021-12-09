import {Todo} from './todo';

export abstract class TodosService {
  getAll(): Promise<Todo[]> {
    throw new Error('Not implemented');
  }
  createTodo(todo: Partial<Todo>): Promise<Todo> {
    throw new Error('Not implemented');
  }
  updateTodo(todo: Todo): Promise<Todo> {
    throw new Error('Not implemented');
  }
  deleteTodo({id}: {id: string}): Promise<void> {
    throw new Error('Not implemented');
  }
}
