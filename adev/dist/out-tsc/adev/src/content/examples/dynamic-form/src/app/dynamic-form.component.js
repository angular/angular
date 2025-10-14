import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, computed, inject, input} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {DynamicFormQuestionComponent} from './dynamic-form-question.component';
import {QuestionControlService} from './question-control.service';
let DynamicFormComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-dynamic-form',
      templateUrl: './dynamic-form.component.html',
      providers: [QuestionControlService],
      imports: [DynamicFormQuestionComponent, ReactiveFormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DynamicFormComponent = class {
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
      DynamicFormComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    qcs = inject(QuestionControlService);
    questions = input([]);
    form = computed(() => this.qcs.toFormGroup(this.questions()));
    payLoad = '';
    onSubmit() {
      this.payLoad = JSON.stringify(this.form().getRawValue());
    }
  };
  return (DynamicFormComponent = _classThis);
})();
export {DynamicFormComponent};
//# sourceMappingURL=dynamic-form.component.js.map
