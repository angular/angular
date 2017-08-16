/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, OnChanges, OnInit, Optional, SimpleChanges} from '@angular/core';
import {MdDialogRef} from './dialog-ref';
import {MdDialogContainer} from './dialog-container';

/** Counter used to generate unique IDs for dialog elements. */
let dialogElementUid = 0;

/**
 * Button that will close the current dialog.
 */
@Directive({
  selector: `button[md-dialog-close], button[mat-dialog-close],
             button[mdDialogClose], button[matDialogClose]`,
  host: {
    '(click)': 'dialogRef.close(dialogResult)',
    '[attr.aria-label]': 'ariaLabel',
    'type': 'button', // Prevents accidental form submits.
  }
})
export class MdDialogClose implements OnChanges {
  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel: string = 'Close dialog';

  /** Dialog close input. */
  @Input('md-dialog-close') dialogResult: any;

  @Input('matDialogClose') _matDialogClose: any;
  @Input('mdDialogClose') _mdDialogClose: any;
  @Input('mat-dialog-close') _matDialogCloseResult: any;

  constructor(public dialogRef: MdDialogRef<any>) { }

  ngOnChanges(changes: SimpleChanges) {
    const proxiedChange = changes._matDialogClose || changes._mdDialogClose ||
        changes._matDialogCloseResult;

    if (proxiedChange) {
      this.dialogResult = proxiedChange.currentValue;
    }
  }
}

/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
  selector: '[md-dialog-title], [mat-dialog-title], [mdDialogTitle], [matDialogTitle]',
  host: {
    'class': 'mat-dialog-title',
    '[id]': 'id',
  },
})
export class MdDialogTitle implements OnInit {
  @Input() id = `md-dialog-title-${dialogElementUid++}`;

  constructor(@Optional() private _container: MdDialogContainer) { }

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
  selector: `[md-dialog-content], md-dialog-content, [mat-dialog-content], mat-dialog-content,
             [mdDialogContent], [matDialogContent]`,
  host: {'class': 'mat-dialog-content'}
})
export class MdDialogContent { }


/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
  selector: `[md-dialog-actions], md-dialog-actions, [mat-dialog-actions], mat-dialog-actions,
             [mdDialogActions], [matDialogActions]`,
  host: {'class': 'mat-dialog-actions'}
})
export class MdDialogActions { }
