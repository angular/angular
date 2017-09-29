/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, InjectionToken, Optional, Inject, isDevMode} from '@angular/core';
import {BidiModule} from '@angular/cdk/bidi';
import {CompatibilityModule} from '../compatibility/compatibility';


/** Injection token that configures whether the Material sanity checks are enabled. */
export const MATERIAL_SANITY_CHECKS = new InjectionToken<boolean>('mat-sanity-checks');


/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, compatibility mode, etc.
 *
 * This module should be imported to each top-level component module (e.g., MatTabsModule).
 */
@NgModule({
  imports: [CompatibilityModule, BidiModule],
  exports: [CompatibilityModule, BidiModule],
  providers: [{
    provide: MATERIAL_SANITY_CHECKS, useValue: true,
  }],
})
export class MatCommonModule {
  /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
  private _hasDoneGlobalChecks = false;

  /** Reference to the global `document` object. */
  private _document = typeof document === 'object' && document ? document : null;

  constructor(@Optional() @Inject(MATERIAL_SANITY_CHECKS) sanityChecksEnabled: boolean) {
    if (sanityChecksEnabled && !this._hasDoneGlobalChecks && isDevMode()) {
      this._checkDoctype();
      this._checkTheme();
      this._hasDoneGlobalChecks = true;
    }
  }

  private _checkDoctype(): void {
    if (this._document && !this._document.doctype) {
      console.warn(
        'Current document does not have a doctype. This may cause ' +
        'some Angular Material components not to behave as expected.'
      );
    }
  }

  private _checkTheme(): void {
    if (this._document && typeof getComputedStyle === 'function') {
      const testElement = this._document.createElement('div');

      testElement.classList.add('mat-theme-loaded-marker');
      this._document.body.appendChild(testElement);

      const computedStyle = getComputedStyle(testElement);

      // In some situations, the computed style of the test element can be null. For example in
      // Firefox, the computed style is null if an application is running inside of a hidden iframe.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
      if (computedStyle && computedStyle.display !== 'none') {
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
