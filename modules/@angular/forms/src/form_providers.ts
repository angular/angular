/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, Type} from '@angular/core';

import {InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES} from './directives';
import {RadioControlRegistry} from './directives/radio_control_value_accessor';
import {FormBuilder} from './form_builder';



/**
 * Shorthand set of providers used for building Angular forms.
 * @experimental
 */
export const FORM_PROVIDERS: Type<any>[] = [RadioControlRegistry];

/**
 * Shorthand set of providers used for building reactive Angular forms.
 * @experimental
 */
export const REACTIVE_FORM_PROVIDERS: Type<any>[] = [FormBuilder, RadioControlRegistry];

/**
 * The ng module for forms.
 * @experimental
 */
@NgModule({
  declarations: TEMPLATE_DRIVEN_DIRECTIVES,
  providers: [FORM_PROVIDERS],
  exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
})
export class FormsModule {
}

/**
 * The ng module for reactive forms.
 * @experimental
 */
@NgModule({
  declarations: [REACTIVE_DRIVEN_DIRECTIVES],
  providers: [REACTIVE_FORM_PROVIDERS],
  exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
})
export class ReactiveFormsModule {
}