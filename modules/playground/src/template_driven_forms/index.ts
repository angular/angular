/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {Component, Directive, Host, NgModule} from '@angular/core';
import {isPresent, print} from '@angular/core/src/facade/lang';
import {FormGroup, FormsModule, NG_VALIDATORS, NgForm} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';



/**
 * A domain model we are binding the form controls to.
 */
class CheckoutModel {
  firstName: string;
  middleName: string;
  lastName: string;
  country: string = 'Canada';

  creditCard: string;
  amount: number;
  email: string;
  comments: string;
}

/**
 * Custom validator.
 */
function creditCardValidator(c: any /** TODO #9100 */): {[key: string]: boolean} {
  if (isPresent(c.value) && /^\d{16}$/.test(c.value)) {
    return null;
  } else {
    return {'invalidCreditCard': true};
  }
}

const creditCardValidatorBinding = {
  provide: NG_VALIDATORS,
  useValue: creditCardValidator,
  multi: true
};

@Directive({selector: '[credit-card]', providers: [creditCardValidatorBinding]})
class CreditCardValidator {
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
@Component({
  selector: 'show-error',
  inputs: ['controlPath: control', 'errorTypes: errors'],
  template: `
    <span *ngIf="errorMessage !== null">{{errorMessage}}</span>
  `
})
class ShowError {
  formDir: any /** TODO #9100 */;
  controlPath: string;
  errorTypes: string[];

  constructor(@Host() formDir: NgForm) { this.formDir = formDir; }

  get errorMessage(): string {
    var form: FormGroup = this.formDir.form;
    var control = form.get(this.controlPath);
    if (isPresent(control) && control.touched) {
      for (var i = 0; i < this.errorTypes.length; ++i) {
        if (control.hasError(this.errorTypes[i])) {
          return this._errorMessage(this.errorTypes[i]);
        }
      }
    }
    return null;
  }

  _errorMessage(code: string): string {
    var config = {'required': 'is required', 'invalidCreditCard': 'is invalid credit card number'};
    return (config as any /** TODO #9100 */)[code];
  }
}


@Component({
  selector: 'template-driven-forms',
  template: `
    <h1>Checkout Form</h1>

    <form (ngSubmit)="onSubmit()" #f="ngForm">
      <p>
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" name="firstName" [(ngModel)]="model.firstName" required>
        <show-error control="firstName" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="middleName">Middle Name</label>
        <input type="text" id="middleName" name="middleName" [(ngModel)]="model.middleName">
      </p>

      <p>
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" name="lastName" [(ngModel)]="model.lastName" required>
        <show-error control="lastName" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="country">Country</label>
        <select id="country" name="country" [(ngModel)]="model.country">
          <option *ngFor="let c of countries" [value]="c">{{c}}</option>
        </select>
      </p>

      <p>
        <label for="creditCard">Credit Card</label>
        <input type="text" id="creditCard" name="creditCard" [(ngModel)]="model.creditCard" required credit-card>
        <show-error control="creditCard" [errors]="['required', 'invalidCreditCard']"></show-error>
      </p>

      <p>
        <label for="amount">Amount</label>
        <input type="number" id="amount" name="amount" [(ngModel)]="model.amount" required>
        <show-error control="amount" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="email">Email</label>
        <input type="email" id="email" name="email" [(ngModel)]="model.email" required>
        <show-error control="email" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="comments">Comments</label>
        <textarea id="comments" name="comments" [(ngModel)]="model.comments">
        </textarea>
      </p>

      <button type="submit" [disabled]="!f.form.valid">Submit</button>
    </form>
  `
})
class TemplateDrivenForms {
  model = new CheckoutModel();
  countries = ['US', 'Canada'];

  onSubmit(): void {
    print('Submitting:');
    print(this.model);
  }
}
@NgModule({
  declarations: [TemplateDrivenForms, CreditCardValidator, ShowError],
  bootstrap: [TemplateDrivenForms],
  imports: [BrowserModule, FormsModule]
})
class ExampleModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
