import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Injectable} from '@angular/core';
import {DropdownQuestion} from './question-dropdown';
import {TextboxQuestion} from './question-textbox';
import {of} from 'rxjs';
let QuestionService = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var QuestionService = class {
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
      QuestionService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // TODO: get from a remote source of question metadata
    getQuestions() {
      const questions = [
        new DropdownQuestion({
          key: 'favoriteAnimal',
          label: 'Favorite Animal',
          options: [
            {key: 'cat', value: 'Cat'},
            {key: 'dog', value: 'Dog'},
            {key: 'horse', value: 'Horse'},
            {key: 'capybara', value: 'Capybara'},
          ],
          order: 3,
        }),
        new TextboxQuestion({
          key: 'firstName',
          label: 'First name',
          value: 'Alex',
          required: true,
          order: 1,
        }),
        new TextboxQuestion({
          key: 'emailAddress',
          label: 'Email',
          type: 'email',
          order: 2,
        }),
      ];
      return of(questions.sort((a, b) => a.order - b.order));
    }
  };
  return (QuestionService = _classThis);
})();
export {QuestionService};
//# sourceMappingURL=question.service.js.map
