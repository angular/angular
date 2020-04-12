/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, HostBinding, Inject, InjectionToken, Optional} from '@angular/core';

/**
 * Token to provide to use native validation as the default form validation.
 */
export const USE_NATIVE_VALIDATION_AS_DEFAULT_FORM_VALIDATION =
    new InjectionToken('UseNativeValidationAsDefaultFormValidation');

/**
 * @description
 *
 * Adds `novalidate` attribute to all forms by default.
 *
 * `novalidate` is used to disable browser's native form validation.
 *
 * If you want to use native validation with Angular forms, just add `ngNativeValidate` attribute:
 *
 * ```
 * <form ngNativeValidate></form>
 * ```
 *
 * @publicApi
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 */
@Directive({
  selector: 'form:not([ngNoForm]):not([ngNativeValidate])',
})
export class ɵNgNoValidate {
  @HostBinding('attr.novalidate') readonly novalidate: string|null;

  constructor(@Optional() @Inject(USE_NATIVE_VALIDATION_AS_DEFAULT_FORM_VALIDATION)
              useNativeValidationAsDefaultFormValidation: boolean|null) {
    this.novalidate = useNativeValidationAsDefaultFormValidation ? null : '';
  }
}

export {ɵNgNoValidate as NgNoValidate};
