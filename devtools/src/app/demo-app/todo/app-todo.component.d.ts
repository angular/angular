/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MatDialog } from '@angular/material/dialog';
export declare class MyServiceA {
}
export declare class AppTodoComponent {
    name: string;
    animal: string;
    viewChildWillThrowAnError: import("@angular/core").Signal<unknown>;
    readonly dialog: MatDialog;
    openDialog(): void;
}
