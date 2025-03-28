// #docregion
import {Component, inject, input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

import {DynamicFormQuestionComponent} from './dynamic-form-question.component';

import {QuestionBase} from './question-base';
import {QuestionControlService} from './question-control.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [QuestionControlService],
  imports: [DynamicFormQuestionComponent, ReactiveFormsModule],
})
export class DynamicFormComponent {
  private readonly qcs = inject(QuestionControlService);

  questions = input<QuestionBase<string>[] | null>([]);
  form: FormGroup = this.qcs.toFormGroup(this.questions() as QuestionBase<string>[]);
  payLoad = '';

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.getRawValue());
  }
}
