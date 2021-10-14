/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Mapping of Material mixins that should be renamed. */
export const materialMixins: Record<string, string> = {
  'mat-core': 'core',
  'mat-core-color': 'core-color',
  'mat-core-theme': 'core-theme',
  'angular-material-theme': 'all-component-themes',
  'angular-material-typography': 'all-component-typographies',
  'angular-material-color': 'all-component-colors',
  'mat-base-typography': 'typography-hierarchy',
  'mat-typography-level-to-styles': 'typography-level',
  'mat-elevation': 'elevation',
  'mat-overridable-elevation': 'overridable-elevation',
  'mat-elevation-transition': 'elevation-transition',
  'mat-ripple': 'ripple',
  'mat-ripple-color': 'ripple-color',
  'mat-ripple-theme': 'ripple-theme',
  'mat-strong-focus-indicators': 'strong-focus-indicators',
  'mat-strong-focus-indicators-color': 'strong-focus-indicators-color',
  'mat-strong-focus-indicators-theme': 'strong-focus-indicators-theme',
  'mat-font-shorthand': 'font-shorthand',
  // The expansion panel is a special case, because the package is called `expansion`, but the
  // mixins were prefixed with `expansion-panel`. This was corrected by the Sass module migration.
  'mat-expansion-panel-theme': 'expansion-theme',
  'mat-expansion-panel-color': 'expansion-color',
  'mat-expansion-panel-typography': 'expansion-typography',
};

// The component themes all follow the same pattern so we can spare ourselves some typing.
[
  'option',
  'optgroup',
  'pseudo-checkbox',
  'autocomplete',
  'badge',
  'bottom-sheet',
  'button',
  'button-toggle',
  'card',
  'checkbox',
  'chips',
  'divider',
  'table',
  'datepicker',
  'dialog',
  'grid-list',
  'icon',
  'input',
  'list',
  'menu',
  'paginator',
  'progress-bar',
  'progress-spinner',
  'radio',
  'select',
  'sidenav',
  'slide-toggle',
  'slider',
  'stepper',
  'sort',
  'tabs',
  'toolbar',
  'tooltip',
  'snack-bar',
  'form-field',
  'tree',
].forEach(name => {
  materialMixins[`mat-${name}-theme`] = `${name}-theme`;
  materialMixins[`mat-${name}-color`] = `${name}-color`;
  materialMixins[`mat-${name}-typography`] = `${name}-typography`;
});

/** Mapping of Material functions that should be renamed. */
export const materialFunctions: Record<string, string> = {
  'mat-color': 'get-color-from-palette',
  'mat-contrast': 'get-contrast-color-from-palette',
  'mat-palette': 'define-palette',
  'mat-dark-theme': 'define-dark-theme',
  'mat-light-theme': 'define-light-theme',
  'mat-typography-level': 'define-typography-level',
  'mat-typography-config': 'define-typography-config',
  'mat-font-size': 'font-size',
  'mat-line-height': 'line-height',
  'mat-font-weight': 'font-weight',
  'mat-letter-spacing': 'letter-spacing',
  'mat-font-family': 'font-family',
};

/** Mapping of Material variables that should be renamed. */
export const materialVariables: Record<string, string> = {
  'mat-light-theme-background': 'light-theme-background-palette',
  'mat-dark-theme-background': 'dark-theme-background-palette',
  'mat-light-theme-foreground': 'light-theme-foreground-palette',
  'mat-dark-theme-foreground': 'dark-theme-foreground-palette',
};

// The palettes all follow the same pattern.
[
  'red',
  'pink',
  'indigo',
  'purple',
  'deep-purple',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'gray',
  'blue-grey',
  'blue-gray',
].forEach(name => (materialVariables[`mat-${name}`] = `${name}-palette`));

/** Mapping of CDK variables that should be renamed. */
export const cdkVariables: Record<string, string> = {
  'cdk-z-index-overlay-container': 'overlay-container-z-index',
  'cdk-z-index-overlay': 'overlay-z-index',
  'cdk-z-index-overlay-backdrop': 'overlay-backdrop-z-index',
  'cdk-overlay-dark-backdrop-background': 'overlay-backdrop-color',
};

/** Mapping of CDK mixins that should be renamed. */
export const cdkMixins: Record<string, string> = {
  'cdk-overlay': 'overlay',
  'cdk-a11y': 'a11y-visually-hidden',
  'cdk-high-contrast': 'high-contrast',
  'cdk-text-field-autofill-color': 'text-field-autofill-color',
  // This one was split up into two mixins which is trickier to
  // migrate so for now we forward to the deprecated variant.
  'cdk-text-field': 'text-field',
};

/**
 * Material variables that have been removed from the public API
 * and which should be replaced with their values.
 */
export const removedMaterialVariables: Record<string, string> = {
  // Note: there's also a usage of a variable called `$pi`, but the name is short enough that
  // it matches things like `$mat-pink`. Don't migrate it since it's unlikely to be used.
  'mat-xsmall': 'max-width: 599px',
  'mat-small': 'max-width: 959px',
  'mat-toggle-padding': '8px',
  'mat-toggle-size': '20px',
  'mat-linear-out-slow-in-timing-function': 'cubic-bezier(0, 0, 0.2, 0.1)',
  'mat-fast-out-slow-in-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'mat-fast-out-linear-in-timing-function': 'cubic-bezier(0.4, 0, 1, 1)',
  'mat-elevation-transition-duration': '280ms',
  'mat-elevation-transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'mat-elevation-color': '#000',
  'mat-elevation-opacity': '1',
  'mat-elevation-prefix': `'mat-elevation-z'`,
  'mat-ripple-color-opacity': '0.1',
  'mat-badge-font-size': '12px',
  'mat-badge-font-weight': '600',
  'mat-badge-default-size': '22px',
  'mat-badge-small-size': '16px',
  'mat-badge-large-size': '28px',
  'mat-button-toggle-standard-height': '48px',
  'mat-button-toggle-standard-minimum-height': '24px',
  'mat-button-toggle-standard-maximum-height': '48px',
  'mat-chip-remove-font-size': '18px',
  'mat-datepicker-selected-today-box-shadow-width': '1px',
  'mat-datepicker-selected-fade-amount': '0.6',
  'mat-datepicker-range-fade-amount': '0.2',
  'mat-datepicker-today-fade-amount': '0.2',
  'mat-calendar-body-font-size': '13px',
  'mat-calendar-weekday-table-font-size': '11px',
  'mat-expansion-panel-header-collapsed-height': '48px',
  'mat-expansion-panel-header-collapsed-minimum-height': '36px',
  'mat-expansion-panel-header-collapsed-maximum-height': '48px',
  'mat-expansion-panel-header-expanded-height': '64px',
  'mat-expansion-panel-header-expanded-minimum-height': '48px',
  'mat-expansion-panel-header-expanded-maximum-height': '64px',
  'mat-expansion-panel-header-transition': '225ms cubic-bezier(0.4, 0, 0.2, 1)',
  'mat-menu-side-padding': '16px',
  'menu-menu-item-height': '48px',
  'menu-menu-icon-margin': '16px',
  'mat-paginator-height': '56px',
  'mat-paginator-minimum-height': '40px',
  'mat-paginator-maximum-height': '56px',
  'mat-stepper-header-height': '72px',
  'mat-stepper-header-minimum-height': '42px',
  'mat-stepper-header-maximum-height': '72px',
  'mat-stepper-label-header-height': '24px',
  'mat-stepper-label-position-bottom-top-gap': '16px',
  'mat-stepper-label-min-width': '50px',
  'mat-vertical-stepper-content-margin': '36px',
  'mat-stepper-side-gap': '24px',
  'mat-stepper-line-width': '1px',
  'mat-stepper-line-gap': '8px',
  'mat-step-sub-label-font-size': '12px',
  'mat-step-header-icon-size': '16px',
  'mat-toolbar-minimum-height': '44px',
  'mat-toolbar-height-desktop': '64px',
  'mat-toolbar-maximum-height-desktop': '64px',
  'mat-toolbar-minimum-height-desktop': '44px',
  'mat-toolbar-height-mobile': '56px',
  'mat-toolbar-maximum-height-mobile': '56px',
  'mat-toolbar-minimum-height-mobile': '44px',
  'mat-tooltip-target-height': '22px',
  'mat-tooltip-font-size': '10px',
  'mat-tooltip-vertical-padding': '6px',
  'mat-tooltip-handset-target-height': '30px',
  'mat-tooltip-handset-font-size': '14px',
  'mat-tooltip-handset-vertical-padding': '8px',
  'mat-tree-node-height': '48px',
  'mat-tree-node-minimum-height': '24px',
  'mat-tree-node-maximum-height': '48px',
};

/**
 * Material variables **without a `mat-` prefix** that have been removed from the public API
 * and which should be replaced with their values. These should be migrated only when there's a
 * Material import, because their names could conflict with other variables in the user's app.
 */
export const unprefixedRemovedVariables: Record<string, string> = {
  'z-index-fab': '20',
  'z-index-drawer': '100',
  'ease-in-out-curve-function': 'cubic-bezier(0.35, 0, 0.25, 1)',
  'swift-ease-out-duration': '400ms',
  'swift-ease-out-timing-function': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  'swift-ease-out': 'all 400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
  'swift-ease-in-duration': '300ms',
  'swift-ease-in-timing-function': 'cubic-bezier(0.55, 0, 0.55, 0.2)',
  'swift-ease-in': 'all 300ms cubic-bezier(0.55, 0, 0.55, 0.2)',
  'swift-ease-in-out-duration': '500ms',
  'swift-ease-in-out-timing-function': 'cubic-bezier(0.35, 0, 0.25, 1)',
  'swift-ease-in-out': 'all 500ms cubic-bezier(0.35, 0, 0.25, 1)',
  'swift-linear-duration': '80ms',
  'swift-linear-timing-function': 'linear',
  'swift-linear': 'all 80ms linear',
  'black-87-opacity': 'rgba(black, 0.87)',
  'white-87-opacity': 'rgba(white, 0.87)',
  'black-12-opacity': 'rgba(black, 0.12)',
  'white-12-opacity': 'rgba(white, 0.12)',
  'black-6-opacity': 'rgba(black, 0.06)',
  'white-6-opacity': 'rgba(white, 0.06)',
  'dark-primary-text': 'rgba(black, 0.87)',
  'dark-secondary-text': 'rgba(black, 0.54)',
  'dark-disabled-text': 'rgba(black, 0.38)',
  'dark-dividers': 'rgba(black, 0.12)',
  'dark-focused': 'rgba(black, 0.12)',
  'light-primary-text': 'white',
  'light-secondary-text': 'rgba(white, 0.7)',
  'light-disabled-text': 'rgba(white, 0.5)',
  'light-dividers': 'rgba(white, 0.12)',
  'light-focused': 'rgba(white, 0.12)',
};
