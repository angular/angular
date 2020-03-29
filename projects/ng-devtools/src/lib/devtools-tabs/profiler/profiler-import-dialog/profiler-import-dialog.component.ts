import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
})
export class ProfilerImportDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProfilerImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}
