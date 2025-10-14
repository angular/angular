import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, input} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
let DynamicFormQuestionComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-question',
      templateUrl: './dynamic-form-question.component.html',
      imports: [ReactiveFormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DynamicFormQuestionComponent = class {
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
      DynamicFormQuestionComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    question = input.required();
    form = input.required();
    get isValid() {
      return this.form().controls[this.question().key].valid;
    }
  };
  return (DynamicFormQuestionComponent = _classThis);
})();
export {DynamicFormQuestionComponent};
//# sourceMappingURL=dynamic-form-question.component.js.map
