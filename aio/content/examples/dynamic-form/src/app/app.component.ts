// #docregion
import { Component }       from '@angular/core';

import { QuestionService } from './question.service';
import { QuestionBase } from './question-base';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h2>Job Application for Heroes</h2>
      <app-dynamic-form [questions]="questions"></app-dynamic-form>
    </div>
  `,
  providers:  [QuestionService]
})
export class AppComponent {
  questions: QuestionBase<any>[];

  constructor(questionService: QuestionService) {
    questionService
      .getQuestions()
      .subscribe(questions => this.questions = questions);
  }
}
