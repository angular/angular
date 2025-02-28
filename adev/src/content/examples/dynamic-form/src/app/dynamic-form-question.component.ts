// #docregion
import {Component, input, Input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

import {QuestionBase} from './question-base';

@Component({
  selector: 'app-question',
  templateUrl: './dynamic-form-question.component.html',
  imports: [ReactiveFormsModule],
})
export class DynamicFormQuestionComponent {
  question = input.required<QuestionBase<string>>();
  form = input.required<FormGroup>();

  get isValid() {
    return this.form().controls[this.question().key].valid;
  }
}
