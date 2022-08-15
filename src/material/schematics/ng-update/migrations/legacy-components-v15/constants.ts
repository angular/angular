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
  'card',
  'checkbox',
  'chips',
  'dialog',
  'form-field',
  'input',
  'menu',
  'option',
  'optgroup',
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

export const MIXINS = COMPONENTS.flatMap(component => [
  `${component}-theme`,
  `${component}-color`,
  `${component}-density`,
  `${component}-typography`,
]);

export const MAT_IMPORT_CHANGE = {
  old: '@angular/material/',
  new: '@angular/material/legacy-',
};

export const MAT_MDC_IMPORT_CHANGE = {
  old: '@angular/material-experimental/mdc-',
  new: '@angular/material/',
};
