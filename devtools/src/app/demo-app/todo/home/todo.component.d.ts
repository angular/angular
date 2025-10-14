/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Todo } from './todo';
export declare class TodoComponent {
    readonly todo: import("@angular/core").InputSignal<Todo>;
    readonly update: import("@angular/core").OutputEmitterRef<Todo>;
    readonly delete: import("@angular/core").OutputEmitterRef<Todo>;
    editMode: boolean;
    toggle(): void;
    completeEdit(label: string): void;
    enableEditMode(): void;
}
