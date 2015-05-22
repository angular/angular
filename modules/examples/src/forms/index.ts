import {bootstrap, NgIf, NgFor, EventEmitter, Component, View} from 'angular2/angular2';
import {
  FormBuilder,
  Validators,
  formDirectives,
  ControlGroup,
  Control,
  ControlArray
} from 'angular2/forms';

import {ObservableWrapper} from 'angular2/src/facade/async';
import {print} from 'angular2/src/facade/lang';

// HeaderFields renders the bound header control group. It can used as follows:
//
//   <survey-header [header]="header"></survey-header>
//
// This component is self-contained and can be tested in isolation.
@Component({selector: 'survey-header', properties: {"header": "header"}})
@View({
  template: `
      <div [control-group]="header">
        <div>
          <label>Title:</label> <br/>
          <input type="text" control="title"/>
          <div *ng-if="! header.controls.title.valid && header.controls.title.dirty">
            Title is required
          </div>
        </div>

        <div>
          <label>Description:</label> <br/>
          <textarea control="description"></textarea>
          <div *ng-if="! header.controls.description.valid && header.controls.description.dirty">
            Description is required
          </div>
        </div>

        <div>
          <label>Publish Date:</label> <br/>
          <input type="date" control="date"/>
        </div>
      </div>
  `,
  directives: [formDirectives, NgIf]
})
class HeaderFields {
  header: ControlGroup;
}



// SurveyQuestion renders an individual question. It can used as follows:
//
//   <survey-question [question]="question" [index]="i" (delete)="onDelete()"></survey-question>
//
// SurveyQuestion uses EventEmitter to fire the delete action.
// This component is self-contained and can be tested in isolation.
@Component({
  selector: 'survey-question',
  events: ['destroy'],
  properties: {"question": "question", "index": "index"}
})
@View({
  template: `
      <h2>Question #{{index}}</h2>

      <button (click)="deleteQuestion()">Delete</button>

      <div [control-group]="question">
        <div>
          <label>Type:</label> <br/>
          <select control="type">
            <option value=""></option>
            <option value="text">Text</option>
            <option value="checkbox">Checkbox</option>
            <option value="textarea">Textarea</option>
          </select>
          <div *ng-if="! question.controls.type.valid && question.controls.type.dirty">
            Type is required
          </div>
        </div>

        <div>
          <label>Question:</label> <br/>
          <input type="text" control="questionText">
          <div *ng-if="! question.controls.questionText.valid && question.controls.questionText.dirty">
            Question is required
          </div>
        </div>

        <div *ng-if="question.contains('responseLength')">
          <label>Response Length:</label> <br/>
          <input type="number" control="responseLength">
          <div *ng-if="! question.controls.responseLength.valid && question.controls.responseLength.dirty">
            Length is required
          </div>
        </div>
      </div>
  `,
  directives: [formDirectives, NgIf]
})
class SurveyQuestion {
  question: ControlGroup;
  index: number;
  destroy: EventEmitter;

  constructor() { this.destroy = new EventEmitter(); }

  deleteQuestion(): void {
    // Invoking an injected event emitter will fire an event,
    // which in this case will result in calling `deleteQuestion(i)`
    ObservableWrapper.callNext(this.destroy, null);
  }
}



// SurveyBuilder is a form that allows you to create a survey.
@Component({selector: 'survey-builder-app', appInjector: [FormBuilder]})
@View({
  template: `
    <h1>Create New Survey</h1>

    <div [control-group]="form">
      <survey-header [header]="form.controls.header"></survey-header>

      <button (click)="addQuestion()">Add Question</button>
      <survey-question
          *ng-for="var q of form.controls.questions.controls; var i=index"
          [question]="q"
          [index]="i + 1"
          (destroy)="destroyQuestion(i)">
      </survey-question>

      <button (click)="submitForm()">Submit</button>
    </div>
  `,
  directives: [formDirectives, NgFor, HeaderFields, SurveyQuestion]
})
class SurveyBuilder {
  form: ControlGroup;

  constructor(public builder: FormBuilder) {
    this.form = builder.group({
      "header": builder.group({
        "title": ["", Validators.required],
        "description": ["", Validators.required],
        "date": ""
      }),
      "questions": builder.array([])
    });
  }

  addQuestion(): void {
    var newQuestion: ControlGroup = this.builder.group(
        {
          "type": ["", Validators.required],
          "questionText": ["", Validators.required],
          "responseLength": [100, Validators.required]
        },
        {
          // Optional controls can be dynamically added or removed from the form.
          // Here, the responseLength field is optional and not included by default.
          "optionals": {"responseLength": false}
        });

    // Every Control has an observable of value changes. You can subscribe to this observable
    // to update the form, update the application model, etc.
    // These observables can also be transformed and combined. This enables implementing
    // complex form interactions in a declarative fashion.
    //
    // We are disabling the responseLength control when the question type is checkbox.
    var typeCtrl: Control = newQuestion.controls['type'];

    ObservableWrapper.subscribe(typeCtrl.valueChanges,
                                (v) => v == 'text' || v == 'textarea' ?
                                           newQuestion.include('responseLength') :
                                           newQuestion.exclude('responseLength'));

    (<ControlArray>this.form.controls['questions']).push(newQuestion);
  }

  destroyQuestion(index: number): void {
    (<ControlArray>this.form.controls['questions']).removeAt(index);
  }

  submitForm(): void {
    print('Submitting a form');
    print(`"value: ${this.form.value}`);
    print(` valid: $ { this.form.valid } `);
    print(` errors: $ { this.form.errors }`);
  }
}

export function main() {
  bootstrap(SurveyBuilder);
}
