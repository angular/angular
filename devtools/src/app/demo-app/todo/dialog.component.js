/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
let DialogComponent = class DialogComponent {
  constructor() {
    this.dialogRef = inject(MatDialogRef);
    this.data = inject(MAT_DIALOG_DATA);
  }
  onNoClick() {
    this.dialogRef.close();
  }
};
DialogComponent = __decorate(
  [
    Component({
      selector: 'app-dialog',
      templateUrl: 'dialog.component.html',
      imports: [
        MatDialogTitle,
        MatDialogContent,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatDialogActions,
        MatDialogClose,
      ],
    }),
  ],
  DialogComponent,
);
export {DialogComponent};
//# sourceMappingURL=dialog.component.js.map
