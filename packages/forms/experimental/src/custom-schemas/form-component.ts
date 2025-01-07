import {Component, input, Input, output} from '@angular/core';
import {FormGroup, ReactiveFormsModule, FormArray, AbstractControl} from '@angular/forms';

import {AsyncPipe, JsonPipe} from '@angular/common';
import {UserFormGroup} from './types';
import {ErrorComponent} from './error.component';

let formInstanceCounter = 0;

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, JsonPipe, ErrorComponent],
  template: `
    @let form = userForm();
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label [for]="formId + '-username'">Username</label>
        <input [id]="formId + '-username'" type="text" formControlName="username"/>
        <app-error [control]="form.get('username')!"></app-error>
      </div>

      <div formGroupName="passwords">
        <div>
          <label [for]="formId + '-password'">Password</label>
          <input [id]="formId + '-password'" type="password" formControlName="password"/>
          <app-error [control]="form.get('passwords.password')!"></app-error>
        </div>
        <div>
          <label [for]="formId + '-confirmationPassword'">Confirm Password</label>
          <input
              [id]="formId + '-confirmationPassword'"
              type="password"
              formControlName="confirmationPassword"
          />
          <app-error [control]="form.get('passwords.confirmationPassword')!"></app-error>
          <app-error [control]="form.get('passwords')!"></app-error>
        </div>
      </div>

      <div formGroupName="shippingAddress">
        <div>
          <label [for]="formId + '-shippingAddress1'">Address Line 1</label>
          <input [id]="formId + '-shippingAddress1'" type="text" formControlName="address1"/>
          <app-error [control]="form.get('shippingAddress.address1')!"></app-error>
        </div>
        <div>
          <label [for]="formId + '-shippingAddress2'">Address Line 2</label>
          <input [id]="formId + '-shippingAddress2'" type="text" formControlName="address2"/>
          <app-error [control]="form.get('shippingAddress.address2')!"></app-error>
        </div>
        <div>
          <label [for]="formId + '-shippingZip'">ZIP Code</label>
          <input [id]="formId + '-shippingZip'" type="number" formControlName="zip"/>
          <app-error [control]="form.get('shippingAddress.zip')!"></app-error>
        </div>
      </div>

      <div formGroupName="billingAddress">
        <div>
          <label [for]="formId + '-isSameAsBilling'">Same as Shipping</label>
          <input
              [id]="formId + '-isSameAsBilling'"
              type="checkbox"
              formControlName="isSameAsBilling"
          />
        </div>

        <div
            formGroupName="address"
            [hidden]="form.get('billingAddress.isSameAsBilling')?.value"
        >
          <div>
            <label [for]="formId + '-billingAddress1'">Address Line 1</label>
            <input
                [id]="formId + '-billingAddress1'"
                type="text"
                formControlName="address1"
            />
            <app-error [control]="form.get('billingAddress.address.address1')!"></app-error>
          </div>
          <div>
            <label [for]="formId + '-billingAddress2'">Address Line 2</label>
            <input
                [id]="formId + '-billingAddress2'"
                type="text"
                formControlName="address2"
            />
            <app-error [control]="form.get('billingAddress.address.address2')!"></app-error>
          </div>
          <div>
            <label [for]="formId + '-billingZip'">ZIP Code</label>
            <input [id]="formId + '-billingZip'" type="number" formControlName="zip"/>
            <app-error [control]="form.get('billingAddress.address.zip')!"></app-error>
          </div>
        </div>
      </div>

      <div formArrayName="languages">
        <label>Languages</label>
        @for (control of form.controls.languages.controls; track control; let i = $index) {
          <div class="language-row">
            <select [id]="formId + '-language-' + i" [formControlName]="i">
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
            <button type="button" (click)="form.controls.languages.removeAt(i)">Remove</button>
            <app-error [control]="control"></app-error>
          </div>
        }
        <button type="button" (click)="addLanguage.emit()">Add Language</button>
      </div>

      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>

    <pre>{{ form.valueChanges|async|json }}</pre>
  `,
  styles: [
    `
    .error-message {
      color: red;
      font-size: 0.8em;
      margin-top: 4px;
    }
    
    .form-level-error {
      margin: 16px 0;
      padding: 8px;
      background-color: #fff5f5;
      border: 1px solid #feb2b2;
      border-radius: 4px;
    }

    form {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
    }

    div {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    input[type="checkbox"] {
      width: auto;
    }

    button {
      background-color: #4299e1;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }

    button:hover:not(:disabled) {
      background-color: #3182ce;
    }
  `,
  ],
})
export class FormComponent {
  readonly userForm = input.required<UserFormGroup>();
  readonly addLanguage = output<void>();
  readonly formId = `form-${formInstanceCounter++}`;

  constructor() {}

  onSubmit() {
    console.log(this.userForm().value);
  }
}
