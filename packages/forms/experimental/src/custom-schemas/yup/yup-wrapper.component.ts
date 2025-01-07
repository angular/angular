import {Component} from '@angular/core';
import {userSchema} from './yup-schema';
import {yupToFormGroup} from './yup-adapter';

import {FormArray, FormControl} from '@angular/forms';
import {FormComponent} from '../form-component';
import {defaultFormValues} from '../values';

@Component({
  selector: 'app-yup-wrapper',
  standalone: true,
  imports: [FormComponent],
  template: `
    <app-generic-form [userForm]="form" (addLanguage)="addLanguage()"></app-generic-form>
  `,
})
export class YupWrapperComponent {
  readonly form = yupToFormGroup(userSchema, defaultFormValues) as any;

  addLanguage() {
    const language = 'en';
    const languagesArray = this.form.get('languages') as FormArray;
    const currentLanguages = languagesArray.value;

    if (!currentLanguages.includes(language)) {
      languagesArray.push(new FormControl(language));
    }
  }
}
