import {NgModule, ModuleWithProviders, Directive} from '@angular/core';
import {MATERIAL_COMPATIBILITY_MODE} from './default-mode';


/** Selector that matches all elements that may have style collisions with material1. */
export const MD_ELEMENTS_SELECTOR = `
  md-autocomplete,
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
  md-dialog-container,
  md-divider,
  md-grid-list,
  md-grid-tile,
  md-grid-tile-footer,
  md-grid-tile-header,
  md-hint,
  md-icon,
  md-ink-bar,
  md-input,
  md-list,
  md-list-item,
  md-menu,
  md-nav-list,
  md-option,
  md-placeholder,
  md-progress-bar,
  md-progress-circle,
  md-radio-button,
  md-radio-group,
  md-select,
  md-sidenav,
  md-slider,
  md-spinner,
  md-tab,
  md-toolbar
`;

/** Directive that enforces that the `md-` prefix cannot be used. */
@Directive({selector: MD_ELEMENTS_SELECTOR})
export class MdPrefixEnforcer {
  constructor() {
    throw Error('The "md-" prefix cannot be used in ng-material v1 compatibility mode.');
  }
}


@NgModule({
  declarations: [MdPrefixEnforcer],
  exports: [MdPrefixEnforcer],
  providers: [{
    provide: MATERIAL_COMPATIBILITY_MODE, useValue: true,
  }],
})
export class NoConflictStyleCompatibilityMode {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NoConflictStyleCompatibilityMode,
      providers: [],
    };
  }
}
