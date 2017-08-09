/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, InjectionToken, Optional, Inject, isDevMode} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {BidiModule} from '@angular/cdk/bidi';
import {CompatibilityModule} from '../compatibility/compatibility';


/** Injection token that configures whether the Material sanity checks are enabled. */
export const MATERIAL_SANITY_CHECKS = new InjectionToken<boolean>('md-sanity-checks');


/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, compatibility mode, etc.
 *
 * This module should be imported to each top-level component module (e.g., MdTabsModule).
 */
@NgModule({
  imports: [CompatibilityModule, BidiModule],
  exports: [CompatibilityModule, BidiModule],
  providers: [{
    provide: MATERIAL_SANITY_CHECKS, useValue: true,
  }],
})
export class MdCommonModule {
  /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
  private _hasDoneGlobalChecks = false;

  constructor(
    @Optional() @Inject(DOCUMENT) private _document: any,
    @Optional() @Inject(MATERIAL_SANITY_CHECKS) _sanityChecksEnabled: boolean) {

    if (_sanityChecksEnabled && !this._hasDoneGlobalChecks && _document && isDevMode()) {
      this._checkDoctype();
      this._checkTheme();
      this._hasDoneGlobalChecks = true;
    }
  }

  private _checkDoctype(): void {
    if (!this._document.doctype) {
      console.warn(
        'Current document does not have a doctype. This may cause ' +
        'some Angular Material components not to behave as expected.'
      );
    }
  }

  private _checkTheme(): void {
    if (typeof getComputedStyle === 'function') {
      const testElement = this._document.createElement('div');

      testElement.classList.add('mat-theme-loaded-marker');
      this._document.body.appendChild(testElement);

      if (getComputedStyle(testElement).display !== 'none') {
        console.warn(
          'Could not find Angular Material core theme. Most Material ' +
          'components may not work as expected. For more info refer ' +
          'to the theming guide: https://material.angular.io/guide/theming'
        );
      }

      this._document.body.removeChild(testElement);
    }
  }
}
