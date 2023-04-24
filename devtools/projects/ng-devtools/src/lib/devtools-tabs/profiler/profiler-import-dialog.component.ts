/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

interface DialogData {
  profilerVersion?: number;
  importedVersion?: number;
  errorMessage?: string;
  status: 'ERROR'|'INVALID_VERSION';
}

@Component({
  selector: 'ng-profiler-import-dialog',
  templateUrl: './profiler-import-dialog.component.html',
  styleUrls: ['./profiler-import-dialog.component.scss'],
})
export class ProfilerImportDialogComponent {
  constructor(
      public dialogRef: MatDialogRef<ProfilerImportDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
