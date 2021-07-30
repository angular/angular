/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ViewContainerRef} from '@angular/core';
import {Direction} from '@angular/cdk/bidi';
import {ComponentType} from '@angular/cdk/overlay';
import {CdkDialogContainer} from './dialog-container';

/** Options for where to set focus to automatically on dialog open */
export type AutoFocusTarget = 'dialog' | 'first-tabbable' | 'first-heading';

/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'dialog' | 'alertdialog';

/** Possible overrides for a dialog's position. */
export interface DialogPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export class DialogConfig<D = any> {
  /** Component to use as the container for the dialog. */
  containerComponent?: ComponentType<CdkDialogContainer>;

  /**
   * Where the attached component should live in Angular's *logical* component tree.
   * This affects what is available for injection and the change detection order for the
   * component instantiated inside of the dialog. This does not affect where the dialog
   * content will be rendered.
   */
  viewContainerRef?: ViewContainerRef;

  /** The id of the dialog. */
  id?: string;

  /** The ARIA role of the dialog. */
  role?: DialogRole = 'dialog';

  /** Custom class(es) for the overlay panel. */
  panelClass?: string | string[] = '';

  /** Whether the dialog has a background. */
  hasBackdrop?: boolean = true;

  /** Custom class(es) for the backdrop. */
  backdropClass?: string | undefined = '';

  /** Whether the dialog can be closed by user interaction. */
  disableClose?: boolean = false;

  /** The width of the dialog. */
  width?: string = '';

  /** The height of the dialog. */
  height?: string = '';

  /** The minimum width of the dialog. */
  minWidth?: string | number = '';

  /** The minimum height of the dialog. */
  minHeight?: string | number = '';

  /** The maximum width of the dialog. */
  maxWidth?: string | number = '80vw';

  /** The maximum height of the dialog. */
  maxHeight?: string | number = '';

  /** The position of the dialog. */
  position?: DialogPosition;

  /** Data to be injected into the dialog content. */
  data?: D | null = null;

  /** The layout direction for the dialog content. */
  direction?: Direction;

  /** ID of the element that describes the dialog. */
  ariaDescribedBy?: string | null = null;

  /** Aria label to assign to the dialog element */
  ariaLabel?: string | null = null;

  /**
   * Where the dialog should focus on open.
   * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or
   * AutoFocusTarget instead.
   */
  autoFocus?: AutoFocusTarget | string | boolean = 'first-tabbable';

  /** Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms). */
  enterAnimationDuration?: string = '225ms';

  /** Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms). */
  exitAnimationDuration?: string = '225ms';
}
