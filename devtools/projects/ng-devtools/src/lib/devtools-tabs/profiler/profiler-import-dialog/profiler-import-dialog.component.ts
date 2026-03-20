/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogClose} from '@angular/material/dialog';
import {ButtonComponent} from '../../../shared/button/button.component';

interface DialogData {
  profilerVersion?: number;
  importedVersion?: number;
  errorMessage?: string;
  status: 'ERROR' | 'INVALID_VERSION';
}

@Component({
  selector: 'ng-profiler-import-dialog',
  templateUrl: './profiler-import-dialog.component.html',
  styleUrls: ['./profiler-import-dialog.component.scss'],
  imports: [MatDialogClose, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilerImportDialogComponent {
  public dialogRef = inject<MatDialogRef<ProfilerImportDialogComponent>>(MatDialogRef);
  public data = inject<DialogData>(MAT_DIALOG_DATA);
}
