/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES} from './directives';
import {RadioControlRegistry} from './directives/radio_control_value_accessor';
import {FormBuilder} from './form_builder';


/**
 * The ng module for forms.
 * @stable
 */
@NgModule({
  declarations: TEMPLATE_DRIVEN_DIRECTIVES,
  providers: [RadioControlRegistry],
  exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
})
export class FormsModule {
}

/**
 * The ng module for reactive forms.
 * @stable
 */
@NgModule({
  declarations: [REACTIVE_DRIVEN_DIRECTIVES],
  providers: [FormBuilder, RadioControlRegistry],
  exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
})
export class ReactiveFormsModule {
}
