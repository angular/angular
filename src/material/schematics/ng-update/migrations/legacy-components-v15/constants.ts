/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const COMPONENTS = [
  'autocomplete',
  'button',
  'core',
  'card',
  'checkbox',
  'chips',
  'dialog',
  'form-field',
  'input',
  'list',
  'menu',
  'paginator',
  'progress-bar',
  'progress-spinner',
  'radio',
  'select',
  'slide-toggle',
  'snack-bar',
  'slider',
  'table',
  'tabs',
  'tooltip',
];

export const MAT_IMPORT_CHANGES = COMPONENTS.map(component => ({
  old: `@angular/material/${component}`,
  new: `@angular/material/legacy-${component}`,
}));

export const MDC_IMPORT_CHANGES = COMPONENTS.map(component => ({
  old: `@angular/material-experimental/mdc-${component}`,
  new: `@angular/material/${component}`,
}));

export const MIXINS = COMPONENTS.concat(['option', 'optgroup']).flatMap(component => [
  `${component}-theme`,
  `${component}-color`,
  `${component}-density`,
  `${component}-typography`,
]);
