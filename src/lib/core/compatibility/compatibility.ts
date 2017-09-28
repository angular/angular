/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, InjectionToken, NgModule} from '@angular/core';

export const MATERIAL_COMPATIBILITY_MODE = new InjectionToken<boolean>('md-compatibility-mode');

/** Selector that matches all elements that may have style collisions with AngularJS Material. */
export const MAT_ELEMENTS_SELECTOR = `
  [mat-button],
  [mat-fab],
  [mat-icon-button],
  [mat-mini-fab],
  [mat-raised-button],
  [matCardSubtitle],
  [matCardTitle],
  [matCellDef],
  [matColumnDef],
  [matDialogActions],
  [matDialogClose],
  [matDialogContent],
  [matDialogTitle],
  [matHeaderCellDef],
  [matHeaderRowDef],
  [matLine],
  [matRowDef],
  [matStepLabel],
  [matStepperNext],
  [matStepperPrevious],
  [matTabLabel],
  [matTabLink],
  [matTabNav],
  [matTooltip],
  [matInput],
  [matPrefix],
  [matSuffix],
  mat-autocomplete,
  mat-button-toggle,
  mat-button-toggle,
  mat-button-toggle-group,
  mat-card,
  mat-card-actions,
  mat-card-content,
  mat-card-footer,
  mat-card-header,
  mat-card-subtitle,
  mat-card-title,
  mat-card-title-group,
  mat-cell,
  mat-checkbox,
  mat-chip,
  mat-dialog-actions,
  mat-dialog-container,
  mat-dialog-content,
  mat-divider,
  mat-error,
  mat-grid-list,
  mat-grid-tile,
  mat-grid-tile-footer,
  mat-grid-tile-header,
  mat-header-cell,
  mat-header-row,
  mat-hint,
  mat-horizontal-stepper,
  mat-icon,
  mat-input-container,
  mat-form-field,
  mat-list,
  mat-list-item,
  mat-menu,
  mat-nav-list,
  mat-option,
  mat-placeholder,
  mat-progress-bar,
  mat-pseudo-checkbox,
  mat-radio-button,
  mat-radio-group,
  mat-row,
  mat-select,
  mat-sidenav,
  mat-sidenav-container,
  mat-slider,
  mat-spinner,
  mat-step,
  mat-tab,
  mat-table,
  mat-tab-group,
  mat-toolbar,
  mat-vertical-stepper`;

/** Selector that matches all elements that may have style collisions with AngularJS Material. */
export const MD_ELEMENTS_SELECTOR = `
  [md-button],
  [md-fab],
  [md-icon-button],
  [md-mini-fab],
  [md-raised-button],
  [mdCardSubtitle],
  [mdCardTitle],
  [mdCellDef],
  [mdColumnDef],
  [mdDialogActions],
  [mdDialogClose],
  [mdDialogContent],
  [mdDialogTitle],
  [mdHeaderCellDef],
  [mdHeaderRowDef],
  [mdLine],
  [mdRowDef],
  [mdStepLabel],
  [mdStepperNext],
  [mdStepperPrevious],
  [mdTabLabel],
  [mdTabLink],
  [mdTabNav],
  [mdTooltip],
  [mdInput],
  [mdPrefix],
  [mdSuffix],
  md-autocomplete,
  md-button-toggle,
  md-button-toggle,
  md-button-toggle-group,
  md-card,
  md-card-actions,
  md-card-content,
  md-card-footer,
  md-card-header,
  md-card-subtitle,
  md-card-title,
  md-card-title-group,
  md-cell,
  md-checkbox,
  md-chip,
  md-dialog-actions,
  md-dialog-container,
  md-dialog-content,
  md-divider,
  md-error,
  md-grid-list,
  md-grid-tile,
  md-grid-tile-footer,
  md-grid-tile-header,
  md-header-cell,
  md-header-row,
  md-hint,
  md-horizontal-stepper,
  md-icon,
  md-input-container,
  md-form-field,
  md-list,
  md-list-item,
  md-menu,
  md-nav-list,
  md-option,
  md-placeholder,
  md-progress-bar,
  md-pseudo-checkbox,
  md-radio-button,
  md-radio-group,
  md-row,
  md-select,
  md-sidenav,
  md-sidenav-container,
  md-slider,
  md-spinner,
  md-step,
  md-tab,
  md-table,
  md-tab-group,
  md-toolbar,
  md-vertical-stepper`;

/** Directive that enforces that the `mat-` prefix cannot be used. */
@Directive({selector: MAT_ELEMENTS_SELECTOR})
export class MatPrefixRejector {}

/** Directive that enforces that the `md-` prefix cannot be used. */
@Directive({selector: MD_ELEMENTS_SELECTOR})
export class MdPrefixRejector {}


/**
 * Module that enforces the default compatibility mode settings. When this module is loaded
 * without NoConflictStyleCompatibilityMode also being imported, it will throw an error if
 * there are any uses of the `mat-` prefix.
 */
@NgModule({
  declarations: [MatPrefixRejector, MdPrefixRejector],
  exports: [MatPrefixRejector, MdPrefixRejector],
})
export class CompatibilityModule {}


/**
 * Module that enforces "no-conflict" compatibility mode settings. When this module is loaded,
 * it will throw an error if there are any uses of the `md-` prefix.
 */
@NgModule()
export class NoConflictStyleCompatibilityMode {}
