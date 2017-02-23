import {
  NgModule,
  ModuleWithProviders,
  Directive,
  OpaqueToken,
  Inject,
  Optional,
} from '@angular/core';


export const MATERIAL_COMPATIBILITY_MODE = new OpaqueToken('md-compatibility-mode');

/** Selector that matches all elements that may have style collisions with AngularJS Material. */
export const MAT_ELEMENTS_SELECTOR = `
  [mat-button],
  [mat-dialog-actions],
  [mat-dialog-close],
  [mat-dialog-content],
  [mat-dialog-title],
  [mat-fab],
  [mat-icon-button],
  [mat-menu-trigger-for],
  [mat-mini-fab],
  [mat-raised-button],
  [mat-tab-label],
  [mat-tab-link],
  [mat-tab-nav-bar],
  [matTooltip],
  mat-autocomplete,
  mat-button-toggle,
  mat-button-toggle-group,
  mat-button-toggle,
  mat-card,
  mat-card-actions,
  mat-card-content,
  mat-card-footer,
  mat-card-header,
  mat-card-subtitle,
  mat-card-title,
  mat-card-title-group,
  mat-checkbox,
  mat-chip,
  mat-dialog-actions,
  mat-dialog-container,
  mat-dialog-content,
  mat-divider,
  mat-grid-list,
  mat-grid-tile,
  mat-grid-tile-footer,
  mat-grid-tile-header,
  mat-hint,
  mat-icon,
  mat-list,
  mat-list-item,
  mat-menu,
  mat-nav-list,
  mat-option,
  mat-placeholder,
  mat-progress-bar,
  mat-progress-circle,
  mat-pseudo-checkbox,
  mat-radio-button,
  mat-radio-group,
  mat-select,
  mat-sidenav,
  mat-sidenav-container,
  mat-slider,
  mat-spinner,
  mat-tab,
  mat-tab-group,
  mat-toolbar`;

/** Selector that matches all elements that may have style collisions with AngularJS Material. */
export const MD_ELEMENTS_SELECTOR = `  
  [md-button],
  [md-dialog-actions],
  [md-dialog-close],
  [md-dialog-content],
  [md-dialog-title],
  [md-fab],
  [md-icon-button],
  [md-menu-trigger-for],
  [md-mini-fab],
  [md-raised-button],
  [md-tab-label],
  [md-tab-link],
  [md-tab-nav-bar],
  [mdTooltip],
  md-autocomplete,
  md-button-toggle,
  md-button-toggle-group,
  md-button-toggle,
  md-card,
  md-card-actions,
  md-card-content,
  md-card-footer,
  md-card-header,
  md-card-subtitle,
  md-card-title,
  md-card-title-group,
  md-checkbox,
  md-chip,
  md-dialog-actions,
  md-dialog-container,
  md-dialog-content,
  md-divider,
  md-grid-list,
  md-grid-tile,
  md-grid-tile-footer,
  md-grid-tile-header,
  md-hint,
  md-icon,
  md-list,
  md-list-item,
  md-menu,
  md-nav-list,
  md-option,
  md-placeholder,
  md-progress-bar,
  md-progress-circle,
  md-pseudo-checkbox,
  md-radio-button,
  md-radio-group,
  md-select,
  md-sidenav,
  md-sidenav-container,
  md-slider,
  md-spinner,
  md-tab,
  md-tab-group,
  md-toolbar`;

/** Directive that enforces that the `mat-` prefix cannot be used. */
@Directive({selector: MAT_ELEMENTS_SELECTOR})
export class MatPrefixRejector {
  constructor(@Optional() @Inject(MATERIAL_COMPATIBILITY_MODE) isCompatibilityMode: boolean) {
    if (!isCompatibilityMode) {
      throw Error('The "mat-" prefix cannot be used out of ng-material v1 compatibility mode.');
    }
  }
}

/** Directive that enforces that the `md-` prefix cannot be used. */
@Directive({selector: MD_ELEMENTS_SELECTOR})
export class MdPrefixRejector {
  constructor(@Optional() @Inject(MATERIAL_COMPATIBILITY_MODE) isCompatibilityMode: boolean) {
    if (isCompatibilityMode) {
      throw Error('The "md-" prefix cannot be used in ng-material v1 compatibility mode.');
    }
  }
}


/**
 * Module that enforces the default compatibility mode settings. When this module is loaded
 * without NoConflictStyleCompatibilityMode also being imported, it will throw an error if
 * there are any uses of the `mat-` prefix.
 */
@NgModule({
  declarations: [MatPrefixRejector, MdPrefixRejector],
  exports: [MatPrefixRejector, MdPrefixRejector],
})
export class CompatibilityModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CompatibilityModule,
      providers: [],
    };
  }
}


/**
 * Module that enforces "no-conflict" compatibility mode settings. When this module is loaded,
 * it will throw an error if there are any uses of the `md-` prefix.
 */
@NgModule({
  providers: [{
    provide: MATERIAL_COMPATIBILITY_MODE, useValue: true,
  }],
})
export class NoConflictStyleCompatibilityMode {}
