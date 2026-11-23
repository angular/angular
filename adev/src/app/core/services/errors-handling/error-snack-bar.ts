/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarRef} from '@angular/material/snack-bar';

const ANGIE_DIR = 'assets/images/angie';

export type ErrorSnackBarPose = 'error' | 'sad' | 'question' | 'greeting';

export interface ErrorSnackBarData {
  message: string;
  actionText?: string;
  pose: ErrorSnackBarPose;
}

@Component({
  selector: 'error-snack-bar',
  template: `
    <img class="error-snack-bar-angie" [src]="poseSrc" alt="" aria-hidden="true" />
    <p>{{ message }}</p>
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
  styles: `
    :host {
      display: flex;
      align-items: center;
      .error-snack-bar-angie {
        width: 40px;
        height: auto;
        margin-right: 16px;
        flex-shrink: 0;
        transform: scale(1.53);
        transform-origin: center;
      }
      p {
        margin: 0;
        flex: 1;
        font: inherit;
      }
      button {
        margin-left: 16px;
        flex-shrink: 0;
      }
    }
  `,
})
export class ErrorSnackBar {
  protected snackBarRef = inject<MatSnackBarRef<ErrorSnackBar>>(MatSnackBarRef);

  protected message: string;
  protected actionText?: string;
  protected poseSrc: string;

  constructor() {
    const data = inject(MAT_SNACK_BAR_DATA) as ErrorSnackBarData;
    this.message = data.message;
    this.actionText = data.actionText;
    this.poseSrc = `${ANGIE_DIR}/${data.pose}.svg`;
  }
}
