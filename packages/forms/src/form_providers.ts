/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModuleWithProviders, NgModule} from '@angular/core';

import {InternalFormsSharedModule, NG_FORM_SELECTOR_WARNING, NG_MODEL_WITH_FORM_CONTROL_WARNING, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES} from './directives';
import {RadioControlRegistry} from './directives/radio_control_value_accessor';
import {FormBuilder} from './form_builder';

/**
 * The ng module for forms.
 *
 */
@NgModule({
  declarations: TEMPLATE_DRIVEN_DIRECTIVES,
  providers: [RadioControlRegistry],
  exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
})
export class FormsModule {
  static withConfig(opts: {
    /** @deprecated as of v6 */ warnOnDeprecatedNgFormSelector?: 'never' | 'once' | 'always',
  }): ModuleWithProviders {
    return {
      ngModule: FormsModule,
      providers:
          [{provide: NG_FORM_SELECTOR_WARNING, useValue: opts.warnOnDeprecatedNgFormSelector}]
    };
  }
}

/**
 * The ng module for reactive forms.
 *
 */
@NgModule({
  declarations: [REACTIVE_DRIVEN_DIRECTIVES],
  providers: [FormBuilder, RadioControlRegistry],
  exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
})
export class ReactiveFormsModule {
  static withConfig(opts: {
    /** @deprecated as of v6 */ warnOnNgModelWithFormControl: 'never' | 'once' | 'always'
  }): ModuleWithProviders<ReactiveFormsModule> {
    return {
      ngModule: ReactiveFormsModule,
      providers: [{
        provide: NG_MODEL_WITH_FORM_CONTROL_WARNING,
        useValue: opts.warnOnNgModelWithFormControl
      }]
    };
  }
}
