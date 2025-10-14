/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
let ProfilerImportDialogComponent = class ProfilerImportDialogComponent {
  constructor() {
    this.dialogRef = inject(MatDialogRef);
    this.data = inject(MAT_DIALOG_DATA);
  }
};
ProfilerImportDialogComponent = __decorate(
  [
    Component({
      selector: 'ng-profiler-import-dialog',
      templateUrl: './profiler-import-dialog.component.html',
      styleUrls: ['./profiler-import-dialog.component.scss'],
      imports: [MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MatButton],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  ProfilerImportDialogComponent,
);
export {ProfilerImportDialogComponent};
//# sourceMappingURL=profiler-import-dialog.component.js.map
