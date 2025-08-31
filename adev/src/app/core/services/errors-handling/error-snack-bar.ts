/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarRef} from '@angular/material/snack-bar';

export interface ErrorSnackBarData {
  message: string;
  actionText?: string;
}

@Component({
  selector: 'error-snack-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    {{ message }}
    <button
      class="docs-primary-btn"
      type="button"
      matSnackBarAction
      [attr.text]="actionText"
      (click)="snackBarRef.dismissWithAction()"
    >
      {{ actionText }}
    </button>
  `,
  imports: [MatSnackBarAction],
  styles: `:host { display: flex; align-items: center; button { margin-left: 16px }}`,
})
export class ErrorSnackBar {
  protected snackBarRef = inject<MatSnackBarRef<ErrorSnackBar>>(MatSnackBarRef);

  protected message: string;
  protected actionText?: string;

  constructor() {
    const data = inject(MAT_SNACK_BAR_DATA) as ErrorSnackBarData;
    this.message = data.message;
    this.actionText = data.actionText;
  }
}
