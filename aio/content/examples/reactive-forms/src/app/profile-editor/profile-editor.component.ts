// #docplaster
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
// #docregion validator-imports
import { Validators } from '@angular/forms';
// #enddocregion validator-imports
import { FormArray } from '@angular/forms';

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
// #enddocregion required-validator
    aliases: this.fb.array([
      this.fb.control('')
    ])
// #docregion required-validator
  });
// #enddocregion required-validator, aliases
// #docregion aliases-getter

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

// #enddocregion aliases-getter
  constructor(private fb: FormBuilder) { }

  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    });
  }
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
}
