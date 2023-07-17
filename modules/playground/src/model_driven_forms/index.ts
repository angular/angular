/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
import {Component, Host, NgModule} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';



/**
 * Custom validator.
 */
function creditCardValidator(c: AbstractControl): {[key: string]: boolean} {
  if (c.value && /^\d{16}$/.test(c.value)) {
    return null;
  } else {
    return {'invalidCreditCard': true};
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
@Component({
  selector: 'show-error',
  inputs: ['controlPath: control', 'errorTypes: errors'],
  template: `
    <span *ngIf="errorMessage !== null">{{errorMessage}}</span>
  `
})
export class ShowError {
  formDir: FormGroupDirective;
  controlPath: string;
  errorTypes: string[];

  constructor(@Host() formDir: FormGroupDirective) {
    this.formDir = formDir;
  }

  get errorMessage(): string {
    const form: FormGroup = this.formDir.form;
    const control = form.get(this.controlPath);
    if (control && control.touched) {
      for (let i = 0; i < this.errorTypes.length; ++i) {
        if (control.hasError(this.errorTypes[i])) {
          return this._errorMessage(this.errorTypes[i]);
        }
      }
    }
    return null;
  }

  private _errorMessage(code: string): string {
    const config: {[key: string]: string} = {
      'required': 'is required',
      'invalidCreditCard': 'is invalid credit card number',
    };
    return config[code];
  }
}


@Component({
  selector: 'reactive-forms',
  viewProviders: [FormBuilder],
  template: `
    <h1>Checkout Form (Reactive)</h1>

    <form (ngSubmit)="onSubmit()" [formGroup]="form" #f="ngForm">
      <p>
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" formControlName="firstName">
        <show-error control="firstName" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="middleName">Middle Name</label>
        <input type="text" id="middleName" formControlName="middleName">
      </p>

      <p>
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" formControlName="lastName">
        <show-error control="lastName" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="country">Country</label>
        <select id="country" formControlName="country">
          <option *ngFor="let c of countries" [value]="c">{{c}}</option>
        </select>
      </p>

      <p>
        <label for="creditCard">Credit Card</label>
        <input type="text" id="creditCard" formControlName="creditCard">
        <show-error control="creditCard" [errors]="['required', 'invalidCreditCard']"></show-error>
      </p>

      <p>
        <label for="amount">Amount</label>
        <input type="number" id="amount" formControlName="amount">
        <show-error control="amount" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="email">Email</label>
        <input type="email" id="email" formControlName="email">
        <show-error control="email" [errors]="['required']"></show-error>
      </p>

      <p>
        <label for="comments">Comments</label>
        <textarea id="comments" formControlName="comments">
        </textarea>
      </p>

      <button type="submit" [disabled]="!f.form.valid">Submit</button>
    </form>
  `
})
export class ReactiveForms {
  form: UntypedFormGroup;
  countries = ['US', 'Canada'];

  constructor(fb: UntypedFormBuilder) {
    this.form = fb.group({
      'firstName': ['', Validators.required],
      'middleName': [''],
      'lastName': ['', Validators.required],
      'country': ['Canada', Validators.required],
      'creditCard': ['', Validators.compose([Validators.required, creditCardValidator])],
      'amount': [0, Validators.required],
      'email': ['', Validators.required],
      'comments': ['']
    });
  }

  onSubmit(): void {
    console.log('Submitting:');
    console.log(this.form.value);
  }
}

@NgModule({
  bootstrap: [ReactiveForms],
  declarations: [ShowError, ReactiveForms],
  imports: [BrowserModule, ReactiveFormsModule]
})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
