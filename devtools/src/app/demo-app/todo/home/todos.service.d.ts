/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Todo } from './todo';
export declare abstract class TodosService {
    getAll(): Promise<Todo[]>;
    createTodo(todo: Partial<Todo>): Promise<Todo>;
    updateTodo(todo: Todo): Promise<Todo>;
    deleteTodo({ id }: {
        id: string;
    }): Promise<void>;
}
