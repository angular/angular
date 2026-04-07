/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ModuleWithProviders, NgModule} from '@angular/core';

import {
  InternalFormsSharedModule,
  NG_MODEL_WITH_FORM_CONTROL_WARNING,
  REACTIVE_DRIVEN_DIRECTIVES,
  TEMPLATE_DRIVEN_DIRECTIVES,
} from './directives';
import {
  CALL_SET_DISABLED_STATE,
  setDisabledStateDefault,
  SetDisabledStateOption,
} from './directives/shared';

/**
 * Exports the required providers and directives for template-driven forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms)
 * @see [Template-driven Forms Guide](guide/forms)
 *
 * @publicApi
 */
@NgModule({
  declarations: TEMPLATE_DRIVEN_DIRECTIVES,
  exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES],
})
export class FormsModule {
  /**
   * @description
   * Provides options for configuring the forms module.
   *
   * @param opts An object of configuration options
   * * `callSetDisabledState` Configures whether to `always` call `setDisabledState`, which is more
   * correct, or to only call it `whenDisabled`, which is the legacy behavior.
   */
  static withConfig(opts: {
    callSetDisabledState?: SetDisabledStateOption;
  }): ModuleWithProviders<FormsModule> {
    return {
      ngModule: FormsModule,
      providers: [
        {
          provide: CALL_SET_DISABLED_STATE,
          useValue: opts.callSetDisabledState ?? setDisabledStateDefault,
        },
      ],
    };
  }
}

/**
 * Exports the required infrastructure and directives for reactive forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms)
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 *
 * @publicApi
 */
@NgModule({
  declarations: [REACTIVE_DRIVEN_DIRECTIVES],
  exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES],
})
export class ReactiveFormsModule {
  /**
   * @description
   * Provides options for configuring the reactive forms module.
   *
   * @param opts An object of configuration options
   * * `warnOnNgModelWithFormControl` Configures when to emit a warning when an `ngModel`
   * binding is used with reactive form directives.
   * * `callSetDisabledState` Configures whether to `always` call `setDisabledState`, which is more
   * correct, or to only call it `whenDisabled`, which is the legacy behavior.
   */
  static withConfig(opts: {
    /** @deprecated as of v6 */ warnOnNgModelWithFormControl?: 'never' | 'once' | 'always';
    callSetDisabledState?: SetDisabledStateOption;
  }): ModuleWithProviders<ReactiveFormsModule> {
    return {
      ngModule: ReactiveFormsModule,
      providers: [
        {
          provide: NG_MODEL_WITH_FORM_CONTROL_WARNING,
          useValue: opts.warnOnNgModelWithFormControl ?? 'always',
        },
        {
          provide: CALL_SET_DISABLED_STATE,
          useValue: opts.callSetDisabledState ?? setDisabledStateDefault,
        },
      ],
    };
  }
}
