/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectionToken} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/**
 * Default `mat-slide-toggle` options that can be overridden.
 * @deprecated Use `MatSlideToggleDefaultOptions` from `@angular/material/slide-toggle` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export interface MatLegacySlideToggleDefaultOptions {
  /** Whether toggle action triggers value changes in slide toggle. */
  disableToggleValue?: boolean;

  /** Default color for slide toggles. */
  color?: ThemePalette;
}

/**
 * Injection token to be used to override the default options for `mat-slide-toggle`
 * @deprecated Use `MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS` from `@angular/material/slide-toggle` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export const MAT_LEGACY_SLIDE_TOGGLE_DEFAULT_OPTIONS =
  new InjectionToken<MatLegacySlideToggleDefaultOptions>('mat-slide-toggle-default-options', {
    providedIn: 'root',
    factory: () => ({disableToggleValue: false}),
  });
