import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

/** @title Listbox with forms validation. */
@Component({
  selector: 'cdk-listbox-forms-validation-example',
  exportAs: 'cdkListboxFormsValidationExample',
  templateUrl: 'cdk-listbox-forms-validation-example.html',
  styleUrls: ['cdk-listbox-forms-validation-example.css'],
})
export class CdkListboxFormsValidationExample {
  signs = [
    'Rat',
    'Ox',
    'Tiger',
    'Rabbit',
    'Dragon',
    'Snake',
    'Horse',
    'Goat',
    'Monkey',
    'Rooster',
    'Dog',
    'Pig',
  ];
  invalid: Observable<boolean>;

  constructor() {
    this.invalid = this.signCtrl.valueChanges.pipe(
      map(() => this.signCtrl.touched && !this.signCtrl.valid),
    );
  }

  // #docregion errors
  signCtrl = new FormControl<string[]>([], Validators.required);

  getErrors() {
    const errors = [];
    if (this.signCtrl.hasError('required')) {
      errors.push('You must enter your zodiac sign');
    }
    if (this.signCtrl.hasError('cdkListboxUnexpectedMultipleValues')) {
      errors.push('You can only select one zodiac sign');
    }
    if (this.signCtrl.hasError('cdkListboxUnexpectedOptionValues')) {
      const invalidOptions = this.signCtrl.getError('cdkListboxUnexpectedOptionValues').values;
      errors.push(`You entered an invalid zodiac sign: ${invalidOptions[0]}`);
    }
    return errors.length ? errors : null;
  }
  // #enddocregion errors
}
