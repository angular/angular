/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MatDialogRef } from '@angular/material/dialog';
interface DialogData {
    profilerVersion?: number;
    importedVersion?: number;
    errorMessage?: string;
    status: 'ERROR' | 'INVALID_VERSION';
}
export declare class ProfilerImportDialogComponent {
    dialogRef: MatDialogRef<ProfilerImportDialogComponent, any>;
    data: DialogData;
}
export {};
