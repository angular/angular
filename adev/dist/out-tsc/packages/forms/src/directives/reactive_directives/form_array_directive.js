/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlContainer} from '../control_container';
import {AbstractFormDirective} from './abstract_form.directive';
const formDirectiveProvider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormArrayDirective),
};
/**
 * @description
 *
 * Binds an existing `FormArray` to a DOM element.
 *
 * This directive accepts an existing `FormArray` instance. It will then use this
 * `FormArray` instance to match any child `FormControl`, `FormGroup`/`FormRecord`,
 * and `FormArray` instances to child `FormControlName`, `FormGroupName`,
 * and `FormArrayName` directives.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see {@link AbstractControl}
 *
 * @usageNotes
 * ### Register Form Array
 *
 * The following example registers a `FormArray` with first name and last name controls,
 * and listens for the *ngSubmit* event when the button is clicked.
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
let FormArrayDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[formArray]',
      providers: [formDirectiveProvider],
      host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
      exportAs: 'ngForm',
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AbstractFormDirective;
  let _form_decorators;
  let _form_initializers = [];
  let _form_extraInitializers = [];
  let _ngSubmit_decorators;
  let _ngSubmit_initializers = [];
  let _ngSubmit_extraInitializers = [];
  var FormArrayDirective = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _form_decorators = [Input('formArray')];
      _ngSubmit_decorators = [Output()];
      __esDecorate(
        null,
        null,
        _form_decorators,
        {
          kind: 'field',
          name: 'form',
          static: false,
          private: false,
          access: {
            has: (obj) => 'form' in obj,
            get: (obj) => obj.form,
            set: (obj, value) => {
              obj.form = value;
            },
          },
          metadata: _metadata,
        },
        _form_initializers,
        _form_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngSubmit_decorators,
        {
          kind: 'field',
          name: 'ngSubmit',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngSubmit' in obj,
            get: (obj) => obj.ngSubmit,
            set: (obj, value) => {
              obj.ngSubmit = value;
            },
          },
          metadata: _metadata,
        },
        _ngSubmit_initializers,
        _ngSubmit_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      FormArrayDirective = _classThis = _classDescriptor.value;
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
     * Tracks the `FormArray` bound to this directive.
     */
    form = __runInitializers(this, _form_initializers, null);
    /**
     * @description
     * Emits an event when the form submission has been triggered.
     */
    ngSubmit =
      (__runInitializers(this, _form_extraInitializers),
      __runInitializers(this, _ngSubmit_initializers, new EventEmitter()));
    /**
     * @description
     * Returns the `FormArray` bound to this directive.
     */
    get control() {
      return this.form;
    }
    constructor() {
      super(...arguments);
      __runInitializers(this, _ngSubmit_extraInitializers);
    }
  };
  return (FormArrayDirective = _classThis);
})();
export {FormArrayDirective};
//# sourceMappingURL=form_array_directive.js.map
