/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectionToken} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/** Default `mat-slide-toggle` options that can be overridden. */
export interface MatSlideToggleDefaultOptions {
  /** Whether toggle action triggers value changes in slide toggle. */
  disableToggleValue?: boolean;

  /** Default color for slide toggles. */
  color?: ThemePalette;
}

/** Injection token to be used to override the default options for `mat-slide-toggle`. */
export const MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS = new InjectionToken<MatSlideToggleDefaultOptions>(
  'mat-slide-toggle-default-options',
  {
    providedIn: 'root',
    factory: () => ({disableToggleValue: false}),
  },
);
