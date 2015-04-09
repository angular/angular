import {bootstrap, Component, Decorator, View, If, For, EventEmitter} from 'angular2/angular2';
import {FormBuilder, Validators, FormDirectives, ControlGroup} from 'angular2/forms';

// HeaderFields renders the bound header control group. It can used as follows:
//
//   <survey-header [header]="header"></survey-header>
//
// This component is self-contained and can be tested in isolation.
@Component({
  selector: 'survey-header',
  properties: {
    "header" : "header"
  }
})
@View({
  template: `
      <div [control-group]="header">
        <div>
          <label>Title:</label> <br/>
          <input type="text" control="title"/>
          <div *if="! header.controls.title.valid && header.controls.title.dirty">
            Title is required
          </div>
        </div>

        <div>
          <label>Description:</label> <br/>
          <textarea control="description"></textarea>
          <div *if="! header.controls.description.valid && header.controls.description.dirty">
            Description is required
          </div>
        </div>

        <div>
          <label>Publish Date:</label> <br/>
          <input type="date" control="date"/>
        </div>
      </div>
  `,
  directives: [FormDirectives, If]
})
class HeaderFields {
  header:ControlGroup;
}



// SurveyQuestion renders an individual question. It can used as follows:
//
//   <survey-question [question]="question" [index]="i" (delete)="onDelete()"></survey-question>
//
// SurveyQuestion uses EventEmitter to fire the delete action.
// This component is self-contained and can be tested in isolation.
@Component({
  selector: 'survey-question',
  properties: {
    "question" : "question",
    "index" : "index"
  }
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
          <div *if="! question.controls.type.valid && question.controls.type.dirty">
            Type is required
          </div>
        </div>

        <div>
          <label>Question:</label> <br/>
          <input type="text" control="questionText">
          <div *if="! question.controls.questionText.valid && question.controls.questionText.dirty">
            Question is required
          </div>
        </div>

        <div *if="question.contains('responseLength')">
          <label>Response Length:</label> <br/>
          <input type="number" control="responseLength">
          <div *if="! question.controls.responseLength.valid && question.controls.responseLength.dirty">
            Length is required
          </div>
        </div>
      </div>
  `,
  directives: [FormDirectives, If]
})
class SurveyQuestion {
  question:ControlGroup;
  index:number;
  onDelete:Function;

  constructor(@EventEmitter("delete") onDelete:Function) {
    this.onDelete = onDelete;
  }

  deleteQuestion() {
    // Invoking an injected event emitter will fire an event,
    // which in this case will result in calling `deleteQuestion(i)`
    this.onDelete();
  }
}



// SurveyBuilder is a form that allows you to create a survey.
@Component({
  selector: 'survey-builder-app',
  injectables: [FormBuilder]
})
@View({
  template: `
    <h1>Create New Survey</h1>

    <div [control-group]="form">
      <survey-header [header]="form.controls.header"></survey-header>

      <button (click)="addQuestion()">Add Question</button>
      <survey-question
          *for="var q of form.controls.questions.controls; var i=index"
          [question]="q"
          [index]="i + 1"
          (delete)="deleteQuestion(i)">
      </survey-question>

      <button (click)="submitForm()">Submit</button>
    </div>
  `,
  directives: [FormDirectives, For, HeaderFields, SurveyQuestion]
})
class SurveyBuilder {
  form:ControlGroup;
  builder:FormBuilder;

  constructor(b:FormBuilder) {
    this.builder = b;
    this.form = b.group({
      "header" : b.group({
        "title" :       ["", Validators.required],
        "description" : ["", Validators.required],
        "date" :        ""
      }),
      "questions": b.array([])
    });
  }

  addQuestion() {
    var newQuestion = this.builder.group({
      "type":           ["", Validators.required],
      "questionText":   ["", Validators.required],
      "responseLength": [100, Validators.required]
    }, {
      // Optional controls can be dynamically added or removed from the form.
      // Here, the responseLength field is optional and not included by default.
      "optionals": {
        "responseLength": false
      }
    });

    // Every Control has an observable of value changes. You can subscribe to this observable
    // to update the form, update the application model, etc.
    // These observables can also be transformed and combined. This enables implementing
    // complex form interactions in a declarative fashion.
    //
    // We are disabling the responseLength control when the question type is checkbox.
    newQuestion.controls.type.valueChanges.subscribe((v) =>
      v == 'text' || v == 'textarea' ?
        newQuestion.include('responseLength') : newQuestion.exclude('responseLength'));

    this.form.controls.questions.push(newQuestion);
  }

  deleteQuestion(index:number) {
    this.form.controls.questions.removeAt(index);
  }

  submitForm() {
    console.log("Submitting a form")
    console.log("value", this.form.value, "valid", this.form.valid, "errors", this.form.errors);
  }
}

export function main() {
  bootstrap(SurveyBuilder);
}
