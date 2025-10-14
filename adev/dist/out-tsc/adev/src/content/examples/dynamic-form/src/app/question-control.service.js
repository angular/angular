import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
let QuestionControlService = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var QuestionControlService = class {
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
      QuestionControlService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    toFormGroup(questions) {
      const group = {};
      questions.forEach((question) => {
        group[question.key] = question.required
          ? new FormControl(question.value || '', Validators.required)
          : new FormControl(question.value || '');
      });
      return new FormGroup(group);
    }
  };
  return (QuestionControlService = _classThis);
})();
export {QuestionControlService};
//# sourceMappingURL=question-control.service.js.map
