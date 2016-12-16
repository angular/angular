import {Directive, Input} from '@angular/core';
import {MdDialogRef} from './dialog-ref';


/**
 * Button that will close the current dialog.
 */
@Directive({
  selector: 'button[md-dialog-close], button[mat-dialog-close]',
  host: {
    '(click)': 'dialogRef.close()',
    '[attr.aria-label]': 'ariaLabel'
  }
})
export class MdDialogClose {
  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel: string = 'Close dialog';

  constructor(public dialogRef: MdDialogRef<any>) { }
}

/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
  selector: '[md-dialog-title], [mat-dialog-title]'
})
export class MdDialogTitle { }


/**
 * Scrollable content container of a dialog.
 */
@Directive({
  selector: '[md-dialog-content], md-dialog-content, [mat-dialog-content], mat-dialog-content'
})
export class MdDialogContent { }


/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
  selector: '[md-dialog-actions], md-dialog-actions, [mat-dialog-actions], mat-dialog-actions'
})
export class MdDialogActions { }
