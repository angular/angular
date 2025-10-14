/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {NgModule} from '@angular/core';
import {
  InternalFormsSharedModule,
  NG_MODEL_WITH_FORM_CONTROL_WARNING,
  REACTIVE_DRIVEN_DIRECTIVES,
  TEMPLATE_DRIVEN_DIRECTIVES,
} from './directives';
import {CALL_SET_DISABLED_STATE, setDisabledStateDefault} from './directives/shared';
/**
 * Exports the required providers and directives for template-driven forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms)
 * @see [Template-driven Forms Guide](guide/forms)
 *
 * @publicApi
 */
let FormsModule = (() => {
  let _classDecorators = [
    NgModule({
      declarations: TEMPLATE_DRIVEN_DIRECTIVES,
      exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FormsModule = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      FormsModule = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @description
     * Provides options for configuring the forms module.
     *
     * @param opts An object of configuration options
     * * `callSetDisabledState` Configures whether to `always` call `setDisabledState`, which is more
     * correct, or to only call it `whenDisabled`, which is the legacy behavior.
     */
    static withConfig(opts) {
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
  };
  return (FormsModule = _classThis);
})();
export {FormsModule};
/**
 * Exports the required infrastructure and directives for reactive forms,
 * making them available for import by NgModules that import this module.
 *
 * @see [Forms Overview](guide/forms)
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 *
 * @publicApi
 */
let ReactiveFormsModule = (() => {
  let _classDecorators = [
    NgModule({
      declarations: [REACTIVE_DRIVEN_DIRECTIVES],
      exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ReactiveFormsModule = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ReactiveFormsModule = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
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
    static withConfig(opts) {
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
  };
  return (ReactiveFormsModule = _classThis);
})();
export {ReactiveFormsModule};
//# sourceMappingURL=form_providers.js.map
