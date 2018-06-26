// #docplaster
// #docregion form-builder
import { Component } from '@angular/core';
// #docregion form-builder-imports
import { FormBuilder } from '@angular/forms';
// #enddocregion form-builder-imports, form-builder
// #docregion form-array-imports
import { FormArray } from '@angular/forms';
// #docregion form-builder-imports, form-builder
// #enddocregion form-builder-imports, form-array-imports

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ProfileEditorComponent {
// #docregion formgroup-compare
  profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    }),
// #enddocregion form-builder, formgroup-compare
    aliases: this.fb.array([
      this.fb.control('')
    ])
// #docregion form-builder, formgroup-compare
  });
// #enddocregion form-builder, formgroup-compare
  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

// #docregion inject-form-builder, form-builder

  constructor(private fb: FormBuilder) { }
// #enddocregion inject-form-builder, form-builder

  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    });
  }

  addAlias() {
    this.aliases.push(this.fb.control(''));
  }
// #docregion form-builder
}
// #enddocregion form-builder
