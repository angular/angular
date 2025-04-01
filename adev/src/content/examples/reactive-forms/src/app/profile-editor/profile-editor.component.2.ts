// #docplaster

import {Component, inject} from '@angular/core';
// #docregion form-builder-imports
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
// #enddocregion form-builder-imports
// #docregion form-array-imports
import {FormArray} from '@angular/forms';
// #enddocregion form-array-imports

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  imports: [ReactiveFormsModule],
})
export class ProfileEditorComponent {
  // #docregion inject-form-builder
  private formBuilder = inject(FormBuilder);
  // #enddocregion inject-form-builder
  // #docregion formgroup-compare, form-builder
  profileForm = this.formBuilder.group({
    firstName: [''],
    lastName: [''],
    address: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
    }),
    // #enddocregion form-builder, formgroup-compare
    aliases: this.formBuilder.array([this.formBuilder.control('')]),
    // #docregion form-builder, formgroup-compare
  });
  // #enddocregion form-builder, formgroup-compare
  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street',
      },
    });
  }

  addAlias() {
    this.aliases.push(this.formBuilder.control(''));
  }
}
