/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive} from '@angular/core';
import {
  CdkPopoverEdit,
  CdkPopoverEditTabOut,
  CdkRowHoverContent,
  CdkEditOpen
} from '@angular/cdk-experimental/popover-edit';

const POPOVER_EDIT_HOST_BINDINGS = {
  'tabIndex': '0',
  'class': 'mat-popover-edit-cell',
  '[attr.aria-haspopup]': 'true',
};

const POPOVER_EDIT_INPUTS = [
  'template: matPopoverEdit',
  'context: matPopoverEditContext',
  'colspan: matPopoverEditColspan',
];

const EDIT_PANE_CLASS = 'mat-edit-pane';

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector: '[matPopoverEdit]:not([matPopoverEditTabOut])',
  host: POPOVER_EDIT_HOST_BINDINGS,
  inputs: POPOVER_EDIT_INPUTS,
})
export class MatPopoverEdit<C> extends CdkPopoverEdit<C> {
  protected panelClass(): string {
    return EDIT_PANE_CLASS;
  }
}

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector: '[matPopoverEdit][matPopoverEditTabOut]',
  host: POPOVER_EDIT_HOST_BINDINGS,
  inputs: POPOVER_EDIT_INPUTS,
})
export class MatPopoverEditTabOut<C> extends CdkPopoverEditTabOut<C> {
  protected panelClass(): string {
    return EDIT_PANE_CLASS;
  }
}

/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered.
 *
 * Note that the contents of this directive are invisible to screen readers.
 * Typically this is used to show a button that launches the edit popup, which
 * is ok because screen reader users can trigger edit by pressing Enter on a focused
 * table cell.
 *
 * If this directive contains buttons for functionality other than opening edit then
 * care should be taken to make sure that this functionality is also exposed in
 * an accessible way.
 */
@Directive({
  selector: '[matRowHoverContent]',
})
export class MatRowHoverContent extends CdkRowHoverContent {
  protected initElement(element: HTMLElement) {
    super.initElement(element);
    element.classList.add('mat-row-hover-content');
  }

  protected prepareElement(element: HTMLElement) {
    super.prepareElement(element);

    const RTL_CLASS = 'mat-row-hover-content-rtl';
    if (this.services.directionality.value === 'rtl') {
      element.classList.add(RTL_CLASS);
    } else {
      element.classList.remove(RTL_CLASS);
    }

    const ANIMATE_CLASS = 'mat-row-hover-content-visible';
    element.classList.remove(ANIMATE_CLASS);
    this.services.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        element.classList.add(ANIMATE_CLASS);
      });
    });
  }
}

/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
@Directive({
  selector: '[matEditOpen]',
})
export class MatEditOpen extends CdkEditOpen {
}
