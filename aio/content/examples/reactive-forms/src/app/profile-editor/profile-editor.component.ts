// #docplaster
// #docregion form-builder
import { Component } from '@angular/core';
// #docregion form-builder-imports
import { FormBuilder } from '@angular/forms';
// #enddocregion form-builder-imports
// #docregion validator-imports
import { Validators } from '@angular/forms';
// #enddocregion validator-imports
// #docregion form-array-imports
import { FormArray } from '@angular/forms';
// #enddocregion form-array-imports

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ProfileEditorComponent {
// #docregion required-validator, aliases
  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    }),
// #enddocregion form-builder, required-validator
    aliases: this.fb.array([
      this.fb.control('')
    ])
// #docregion form-builder, required-validator
  });
// #enddocregion form-builder, required-validator, aliases
// #docregion aliases-getter

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

// #enddocregion aliases-getter
// #docregion inject-form-builder, form-builder
  constructor(private fb: FormBuilder) { }

// #enddocregion inject-form-builder

  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    });
  }
// #enddocregion form-builder
// #docregion add-alias

  addAlias() {
    this.aliases.push(this.fb.control(''));
  }
// #enddocregion add-alias
// #docregion on-submit

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }
// #enddocregion on-submit
// #docregion form-builder
}
// #enddocregion form-builder
