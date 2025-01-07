import {Component, Output, EventEmitter} from '@angular/core';
import {userSchema} from './zod-schema';
import {zodToFormGroup} from './zod-adapter';
import {FormComponent} from '../form-component';
import {FormArray, FormControl} from '@angular/forms';
import {defaultFormValues} from '../values';

@Component({
  selector: 'app-zod-wrapper',
  standalone: true,
  imports: [FormComponent],
  template: `
    <app-generic-form [userForm]="form" (addLanguage)="addLanguage()"></app-generic-form>
  `,
})
export class ZodWrapperComponent {
  readonly form = zodToFormGroup(userSchema, defaultFormValues);

  addLanguage() {
    const language = 'en';
    const languagesArray = this.form.get('languages') as FormArray;
    const currentLanguages = languagesArray.value;

    if (!currentLanguages.includes(language)) {
      languagesArray.push(new FormControl(language));
    }
  }
}
