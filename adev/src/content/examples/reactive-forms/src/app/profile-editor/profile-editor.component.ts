// #docplaster
import {Component} from '@angular/core';
import {FormBuilder} from '@angular/forms';
// #docregion validator-imports
import {Validators} from '@angular/forms';
// #enddocregion validator-imports
import {FormArray} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  standalone: false,
})
export class ProfileEditorComponent {
  // #docregion required-validator, aliases
  profileForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: [''],
    address: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
    }),
    // #enddocregion required-validator
    aliases: this.formBuilder.array([this.formBuilder.control('')]),
    // #docregion required-validator
  });
  // #enddocregion required-validator, aliases
  // #docregion aliases-getter

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

  // #enddocregion aliases-getter
  constructor(private formBuilder: FormBuilder) {}

  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street',
      },
    });
  }
  // #docregion add-alias

  addAlias() {
    this.aliases.push(this.formBuilder.control(''));
  }
  // #enddocregion add-alias
  // #docregion on-submit

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }
  // #enddocregion on-submit
}
