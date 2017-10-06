/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, OnChanges, OnInit, Optional, SimpleChanges} from '@angular/core';
import {MatDialogRef} from './dialog-ref';
import {MatDialogContainer} from './dialog-container';

/** Counter used to generate unique IDs for dialog elements. */
let dialogElementUid = 0;

/**
 * Button that will close the current dialog.
 */
@Directive({
  selector: `button[mat-dialog-close], button[matDialogClose]`,
  exportAs: 'matDialogClose',
  host: {
    '(click)': 'dialogRef.close(dialogResult)',
    '[attr.aria-label]': 'ariaLabel',
    'type': 'button', // Prevents accidental form submits.
  }
})
export class MatDialogClose implements OnChanges {
  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel: string = 'Close dialog';

  /** Dialog close input. */
  @Input('mat-dialog-close') dialogResult: any;

  @Input('matDialogClose') _matDialogClose: any;

  constructor(public dialogRef: MatDialogRef<any>) { }

  ngOnChanges(changes: SimpleChanges) {
    const proxiedChange = changes._matDialogClose || changes._matDialogCloseResult;

    if (proxiedChange) {
      this.dialogResult = proxiedChange.currentValue;
    }
  }
}

/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
  selector: '[mat-dialog-title], [matDialogTitle]',
  exportAs: 'matDialogTitle',
  host: {
    'class': 'mat-dialog-title',
    '[id]': 'id',
  },
})
export class MatDialogTitle implements OnInit {
  @Input() id = `mat-dialog-title-${dialogElementUid++}`;

  constructor(@Optional() private _container: MatDialogContainer) { }

  ngOnInit() {
    if (this._container && !this._container._ariaLabelledBy) {
      Promise.resolve().then(() => this._container._ariaLabelledBy = this.id);
    }
  }
}


/**
 * Scrollable content container of a dialog.
 */
@Directive({
  selector: `[mat-dialog-content], mat-dialog-content, [matDialogContent]`,
  host: {'class': 'mat-dialog-content'}
})
export class MatDialogContent { }


/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
  selector: `[mat-dialog-actions], mat-dialog-actions, [matDialogActions]`,
  host: {'class': 'mat-dialog-actions'}
})
export class MatDialogActions { }
