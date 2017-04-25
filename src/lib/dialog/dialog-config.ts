import {ViewContainerRef} from '@angular/core';

/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'dialog' | 'alertdialog';

/** Possible overrides for a dialog's position. */
export interface DialogPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

/**
 * Configuration for opening a modal dialog with the MdDialog service.
 */
export class MdDialogConfig {

  /**
   * Where the attached component should live in Angular's *logical* component tree.
   * This affects what is available for injection and the change detection order for the
   * component instantiated inside of the dialog. This does not affect where the dialog
   * content will be rendered.
   */
  viewContainerRef?: ViewContainerRef;

  /** The ARIA role of the dialog element. */
  role?: DialogRole = 'dialog';

  /** Whether the dialog has a backdrop. */
  hasBackdrop?: boolean = true;

  /** Custom class for the backdrop, */
  backdropClass?: string = '';

  /** Whether the user can use escape or clicking outside to close a modal. */
  disableClose?: boolean = false;

  /** Width of the dialog. */
  width?: string = '';

  /** Height of the dialog. */
  height?: string = '';

  /** Position overrides. */
  position?: DialogPosition;

  /** Data being injected into the child component. */
  data?: any = null;

  // TODO(jelbourn): add configuration for lifecycle hooks, ARIA labelling.
}
