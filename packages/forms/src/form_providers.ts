/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModuleWithProviders, NgModule} from '@angular/core';

import {InternalFormsSharedModule, NG_MODEL_WITH_FORM_CONTROL_WARNING, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES, USE_NATIVE_VALIDATION_AS_DEFAULT_FORM_VALIDATION} from './directives';
import {RadioControlRegistry} from './directives/radio_control_value_accessor';
import {FormBuilder} from './form_builder';

/**
 * Exports the required providers and directives for template-driven forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](/guide/forms-overview)
 * @see [Template-driven Forms Guide](/guide/forms)
 *
 * @publicApi
 */
@NgModule({
  declarations: TEMPLATE_DRIVEN_DIRECTIVES,
  providers: [RadioControlRegistry],
  exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
})
export class FormsModule {
  /**
   * @description
   * Provides options for configuring the forms module.
   *
   * @param opts An object of configuration options.
   */
  static withConfig(opts: FormsConfigurationOptions): ModuleWithProviders<FormsModule> {
    return {
      ngModule: FormsModule,
      providers: [{
        provide: USE_NATIVE_VALIDATION_AS_DEFAULT_FORM_VALIDATION,
        useValue: opts.useNativeValidationAsDefaultFormValidation
      }]
    };
  }
}

/**
 * Exports the required infrastructure and directives for reactive forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms-overview)
 * @see [Reactive Forms Guide](guide/reactive-forms)
 *
 * @publicApi
 */
@NgModule({
  declarations: [REACTIVE_DRIVEN_DIRECTIVES],
  providers: [FormBuilder, RadioControlRegistry],
  exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
})
export class ReactiveFormsModule {
  /**
   * @description
   * Provides options for configuring the reactive forms module.
   *
   * @param opts An object of configuration options.
   */
  static withConfig(opts: ReactiveFormsConfigurationOptions):
      ModuleWithProviders<ReactiveFormsModule> {
    return {
      ngModule: ReactiveFormsModule,
      providers: [
        {provide: NG_MODEL_WITH_FORM_CONTROL_WARNING, useValue: opts.warnOnNgModelWithFormControl},
        {
          provide: USE_NATIVE_VALIDATION_AS_DEFAULT_FORM_VALIDATION,
          useValue: opts.useNativeValidationAsDefaultFormValidation
        }
      ]
    };
  }
}

/**
 * A set of configuration options for the forms or reactive forms module
 *
 * @publicApi
 */
export interface SharedFormsConfigurationOptions {
  /**
   * Configures native validation as the default form validation.
   */
  useNativeValidationAsDefaultFormValidation?: boolean;
}

/**
 * A set of configuration options for the forms module
 *
 * @publicApi
 */
export interface FormsConfigurationOptions extends SharedFormsConfigurationOptions {}

/**
 * A set of configuration options for the reactive forms module
 *
 * @publicApi
 */
export interface ReactiveFormsConfigurationOptions extends SharedFormsConfigurationOptions {
  /**
   * Configures when to emit a warning when an `ngModel` binding is used with reactive form
   * directives.
   * @deprecated as of v6
   */
  warnOnNgModelWithFormControl?: 'never'|'once'|'always';
}
