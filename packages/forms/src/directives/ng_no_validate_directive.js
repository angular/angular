/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Directive} from '@angular/core';
/**
 * @description
 *
 * Adds `novalidate` attribute to all forms by default.
 *
 * `novalidate` is used to disable browser's native form validation.
 *
 * If you want to use native validation with Angular forms, just add `ngNativeValidate` attribute:
 *
 * ```html
 * <form ngNativeValidate></form>
 * ```
 *
 * @publicApi
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 */
let ɵNgNoValidate = class ɵNgNoValidate {};
ɵNgNoValidate = __decorate(
  [
    Directive({
      selector: 'form:not([ngNoForm]):not([ngNativeValidate])',
      host: {'novalidate': ''},
      standalone: false,
    }),
  ],
  ɵNgNoValidate,
);
export {ɵNgNoValidate};
export {ɵNgNoValidate as NgNoValidate};
//# sourceMappingURL=ng_no_validate_directive.js.map
