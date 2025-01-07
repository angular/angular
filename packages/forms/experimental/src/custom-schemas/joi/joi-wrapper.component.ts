import {Component} from '@angular/core';
import {userSchema} from './joi-schema';
import {joiToFormGroup} from './joi-adapter';
import {FormComponent} from '../form-component';
import {FormArray, FormControl} from '@angular/forms';
import {defaultFormValues} from '../values';

@Component({
  selector: 'app-joi-wrapper',
  standalone: true,
  imports: [FormComponent],
  template: `
    <app-generic-form [userForm]="form" (addLanguage)="addLanguage()"></app-generic-form>
  `,
})
export class JoiWrapperComponent {
  readonly form = joiToFormGroup(userSchema, defaultFormValues) as any;

  addLanguage() {
    const language = 'en';
    const languagesArray = this.form.get('languages') as FormArray;
    const currentLanguages = languagesArray.value;

    if (!currentLanguages.includes(language)) {
      languagesArray.push(new FormControl(language));
    }
  }
}
