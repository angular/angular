import {NgModule, ModuleWithProviders, Directive, OpaqueToken, Inject} from '@angular/core';


export const MATERIAL_COMPATIBILITY_MODE = new OpaqueToken('md-compatibiility-mode');

/** Selector that matches all elements that may have style collisions with material1. */
export const MAT_ELEMENTS_SELECTOR = `
  mat-autocomplete,
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
  mat-dialog-container,
  mat-divider,
  mat-grid-list,
  mat-grid-tile,
  mat-grid-tile-footer,
  mat-grid-tile-header,
  mat-hint,
  mat-icon,
  mat-ink-bar,
  mat-input,
  mat-list,
  mat-list-item,
  mat-menu,
  mat-nav-list,
  mat-option,
  mat-placeholder,
  mat-progress-bar,
  mat-progress-circle,
  mat-radio-button,
  mat-radio-group,
  mat-select,
  mat-sidenav,
  mat-slider,
  mat-spinner,
  mat-tab,
  mat-toolbar
`;

/** Directive that enforces that the `mat-` prefix cannot be used. */
@Directive({selector: MAT_ELEMENTS_SELECTOR})
export class MatPrefixEnforcer {
  constructor(@Inject(MATERIAL_COMPATIBILITY_MODE) isCompatibilityMode: boolean) {
    if (!isCompatibilityMode) {
      throw Error('The "mat-" prefix cannot be used out of ng-material v1 compatibility mode.');
    }
  }
}


/**
 * Module that enforces the default "compatibility mode" settings. When this module is loaded
 * without NoConflictStyleCompatibilityMode also being imported, it will throw an error if
 * there are any uses of the `mat-` prefix.
 *
 * Because the point of this directive is to *not* be used, it will be tree-shaken away by
 * optimizers when not in compatibility mode.
 */
@NgModule({
  declarations: [MatPrefixEnforcer],
  exports: [MatPrefixEnforcer],
  providers: [{
    provide: MATERIAL_COMPATIBILITY_MODE, useValue: false,
  }]
})
export class DefaultStyleCompatibilityModeModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DefaultStyleCompatibilityModeModule,
      providers: [],
    };
  }
}
