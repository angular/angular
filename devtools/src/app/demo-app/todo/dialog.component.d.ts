/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MatDialogRef } from '@angular/material/dialog';
export interface DialogData {
    animal: string;
    name: string;
}
export declare class DialogComponent {
    dialogRef: MatDialogRef<DialogComponent, any>;
    data: DialogData;
    onNoClick(): void;
}
