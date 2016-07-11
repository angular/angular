/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModule, PLATFORM_DIRECTIVES, Type} from '@angular/core';

import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES} from './directives';
import {RadioControlRegistry} from './directives/radio_control_value_accessor';
import {FormBuilder} from './form_builder';



/**
 * Shorthand set of providers used for building Angular forms.
 * @experimental
 */
export const FORM_PROVIDERS: Type[] = /*@ts2dart_const*/[RadioControlRegistry];

/**
 * Shorthand set of providers used for building reactive Angular forms.
 * @experimental
 */
export const REACTIVE_FORM_PROVIDERS: Type[] =
    /*@ts2dart_const*/[FormBuilder, RadioControlRegistry];

/**
 * The app module for forms.
 * @experimental
 */
@AppModule({providers: [FORM_PROVIDERS], directives: FORM_DIRECTIVES, pipes: []})
export class FormsModule {
}

/**
 * The app module for reactive forms.
 * @experimental
 */
@AppModule({providers: [REACTIVE_FORM_PROVIDERS], directives: REACTIVE_FORM_DIRECTIVES, pipes: []})
export class ReactiveFormsModule {
}

/**
 * @deprecated
 */
export function disableDeprecatedForms(): any[] {
  return [];
}

/**
 * @deprecated
 */
export function provideForms(): any[] {
  return [
    {provide: PLATFORM_DIRECTIVES, useValue: FORM_DIRECTIVES, multi: true}, REACTIVE_FORM_PROVIDERS
  ];
}