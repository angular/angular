// #docregion
import {Component, inject, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

import {DynamicFormQuestionComponent} from './dynamic-form-question.component';

import {QuestionBase} from './question-base';
import {QuestionControlService} from './question-control.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [QuestionControlService],
  imports: [CommonModule, DynamicFormQuestionComponent, ReactiveFormsModule],
})
export class DynamicFormComponent {
  @Input() questions: QuestionBase<string>[] | null = [];
  payLoad = '';

  private qcs = inject(QuestionControlService);
  form = this.qcs.toFormGroup(this.questions as QuestionBase<string>[]);

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.getRawValue());
  }
}
