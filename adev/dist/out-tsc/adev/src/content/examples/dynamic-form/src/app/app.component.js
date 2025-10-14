import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {DynamicFormComponent} from './dynamic-form.component';
import {QuestionService} from './question.service';
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <div>
      <h2>Job Application for Heroes</h2>
      <app-dynamic-form [questions]="questions$ | async" />
    </div>
  `,
      providers: [QuestionService],
      imports: [AsyncPipe, DynamicFormComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppComponent = class {
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
      AppComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    questions$ = inject(QuestionService).getQuestions();
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
