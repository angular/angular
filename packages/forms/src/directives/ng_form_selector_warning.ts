/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, InjectionToken, Optional} from '@angular/core';

/**
 * Token to provide turn off warning when using 'ngForm' deprecated selector.
 */
export const NG_FORM_SELECTOR_WARNING = new InjectionToken('NgFormSelectorWarning');

/**
 * This directive is soly used to display warnings when the deprecated `ngForm` selector is used.
 *
 * @deprecated in Angular v6 and will be removed in Angular v9.
 *
 */
@Directive({selector: 'ngForm'})
export class NgFormSelectorWarning {
  /**
   * Static property used to track FormControlDirective. Used to support warning config of "once".
   *
   * @internal
   */
  static _ngFormWarning = false;

  constructor(@Optional() @Inject(NG_FORM_SELECTOR_WARNING) private ngFormWarning: string|null) {
    if (!ngFormWarning || 
        (ngFormWarning === 'once' && !NgFormSelectorWarning._ngFormWarning) ||
        ngFormWarning === 'always') {
      console.warn(`
      It looks like you're using 'ngForm'.

      Support for using 'ngForm' element selector has been deprecated in Angular v6 and will be removed
      in Angular v9.
      
      Use 'ng-form' instead.
      `);

      NgFormSelectorWarning._ngFormWarning = true;
    }
  }
}