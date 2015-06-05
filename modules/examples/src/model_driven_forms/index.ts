import {bootstrap, onChange, NgIf, Component, Directive, View, Ancestor} from 'angular2/angular2';
import {
  formDirectives,
  ControlDirective,
  Validators,
  FormModelDirective,
  FormBuilder
} from 'angular2/forms';

import {ObservableWrapper} from 'angular2/src/facade/async';
import {RegExpWrapper, print, isPresent} from 'angular2/src/facade/lang';

import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

/**
 * Custom validator.
 */
function creditCardValidator(c): StringMap<string, boolean> {
  if (isPresent(c.value) && RegExpWrapper.test(new RegExp("^\\d{16}$"), c.value)) {
    return null;
  } else {
    return {"invalidCreditCard": true};
  }
}

/**
 * This is a component that displays an error message.
 *
 * For instance,
 *
 * <show-error control="creditCard" [errors]="['required', 'invalidCreditCard']"></show-error>
 *
 * Will display the "is required" error if the control is empty, and "invalid credit card" if the
 * control is not empty
 * but not valid.
 *
 * In a real application, this component would receive a service that would map an error code to an
 * actual error message.
 * To make it simple, we are using a simple map here.
 */
@Component({selector: 'show-error', properties: ['controlPath: control', 'errorTypes: errors']})
@View({
  template: `
    <span *ng-if="errorMessage !== null">{{errorMessage}}</span>
  `,
  directives: [NgIf]
})
class ShowError {
  formDir;
  controlPath: string;
  errorTypes: List<string>;

  constructor(@Ancestor() formDir: FormModelDirective) { this.formDir = formDir; }

  get errorMessage() {
    var c = this.formDir.form.find(this.controlPath);
    for (var i = 0; i < this.errorTypes.length; ++i) {
      if (isPresent(c) && c.touched && c.hasError(this.errorTypes[i])) {
        return this._errorMessage(this.errorTypes[i]);
      }
    }
    return null;
  }

  _errorMessage(code) {
    var config = {'required': 'is required', 'invalidCreditCard': 'is invalid credit card number'};
    return config[code];
  }
}


@Component({selector: 'model-driven-forms', appInjector: [FormBuilder]})
@View({
  template: `
    <h1>Checkout Form (Model Driven)</h1>

    <form (ng-submit)="onSubmit()" [ng-form-model]="form" #f="form">
      <p>
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" ng-control="firstName">
        <show-error control="firstName" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="middleName">Middle Name</label>
        <input type="text" id="middleName" ng-control="middleName">
      </p>

      <p>
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" ng-control="lastName">
        <show-error control="lastName" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="creditCard">Credit Card</label>
        <input type="text" id="creditCard" ng-control="creditCard">
        <show-error control="creditCard" [errors]="['required', 'invalidCreditCard']"></show-error>
      </p>

      <p>
        <label for="amount">Amount</label>
        <input type="number" id="amount" ng-control="amount">
        <show-error control="amount" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="email">Email</label>
        <input type="email" id="email" ng-control="email">
        <show-error control="email" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="comments">Comments</label>
        <textarea id="comments" ng-control="comments">
        </textarea>
      </p>

      <button type="submit" [disabled]="!f.form.valid">Submit</button>
    </form>
  `,
  directives: [formDirectives, ShowError]
})
class ModelDrivenForms {
  form;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      "firstName": ["", Validators.required],
      "middleName": [""],
      "lastName": ["", Validators.required],
      "creditCard": ["", Validators.compose([Validators.required, creditCardValidator])],
      "amount": [0, Validators.required],
      "email": ["", Validators.required],
      "comments": [""]
    });
  }

  onSubmit() {
    print("Submitting:");
    print(this.form.value);
  }
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(ModelDrivenForms);
}
