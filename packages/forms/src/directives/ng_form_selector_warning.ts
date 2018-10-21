/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, InjectionToken, Optional} from '@angular/core';
import {TemplateDrivenErrors} from './template_driven_errors';

/**
 * Token to provide to turn off the warning when using 'ngForm' deprecated selector.
 */
export const NG_FORM_SELECTOR_WARNING = new InjectionToken('NgFormSelectorWarning');

/**
 * This directive is solely used to display warnings when the deprecated `ngForm` selector is used.
 *
 * @deprecated in Angular v6 and will be removed in Angular v9.
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({selector: 'ngForm'})
export class NgFormSelectorWarning {
  /**
   * Static property used to track whether the deprecation warning for this selector has been sent.
   * Used to support warning config of "once".
   *
   * @internal
   */
  static _ngFormWarning = false;

  constructor(@Optional() @Inject(NG_FORM_SELECTOR_WARNING) ngFormWarning: string|null) {
    if (((!ngFormWarning || ngFormWarning === 'once') && !NgFormSelectorWarning._ngFormWarning) ||
        ngFormWarning === 'always') {
      TemplateDrivenErrors.ngFormWarning();
      NgFormSelectorWarning._ngFormWarning = true;
    }
  }
}
