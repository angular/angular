import {ViewContainerRef} from '@angular/core';

/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'dialog' | 'alertdialog'



/**
 * Configuration for opening a modal dialog with the MdDialog service.
 */
export class MdDialogConfig {
  viewContainerRef?: ViewContainerRef;

  /** The ARIA role of the dialog element. */
  role?: DialogRole = 'dialog';

  /** Whether the user can use escape or clicking outside to close a modal. */
  disableClose?: boolean = false;

  // TODO(jelbourn): add configuration for size, lifecycle hooks, ARIA labelling.
}
