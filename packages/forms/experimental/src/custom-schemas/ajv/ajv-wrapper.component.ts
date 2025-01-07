import {Component} from '@angular/core';
import {userSchema} from './ajv-schema';
import {ajvToFormGroup} from './ajv-adapter';
import {FormComponent} from '../form-component';
import {FormArray, FormControl} from '@angular/forms';
import {defaultFormValues} from '../values';
import {UserFormGroup} from '../types';

@Component({
  selector: 'app-ajv-wrapper',
  standalone: true,
  imports: [FormComponent],
  template: `
    <app-generic-form [userForm]="form" (addLanguage)="addLanguage()"></app-generic-form>
  `,
})
export class AjvWrapperComponent {
  readonly form = ajvToFormGroup(userSchema, defaultFormValues);

  addLanguage() {
    const language = 'en';
    const languagesArray = this.form.get('languages') as FormArray;
    const currentLanguages = languagesArray.value;

    if (!currentLanguages.includes(language)) {
      languagesArray.push(new FormControl(language));
    }
  }
}
