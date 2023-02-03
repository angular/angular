import { Injectable } from '@angular/core';
import { Validators, FormRecord, FormControl } from '@angular/forms';

import { QuestionBase } from './question-base';

@Injectable()
export class QuestionControlService {
  toFormGroup(questions: QuestionBase<string>[] ) {
    const form = new FormRecord<FormControl>({});

    questions.forEach(question => {
      form.addControl(
        question.key,
        question.required 
        ? new FormControl(question.value || '', Validators.required)
        : new FormControl(question.value || '')
      );
    });
    return form;
  }
}
