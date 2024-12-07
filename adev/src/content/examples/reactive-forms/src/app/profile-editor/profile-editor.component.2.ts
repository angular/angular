// #docplaster
// #docregion form-builder
import {Component, inject} from '@angular/core';
// #docregion form-builder-imports
import {FormBuilder} from '@angular/forms';
// #enddocregion form-builder-imports, form-builder
// #docregion form-array-imports
import {FormArray} from '@angular/forms';
// #docregion form-builder-imports, form-builder
// #enddocregion form-builder-imports, form-array-imports

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  standalone: false,
})
export class ProfileEditorComponent {
  // #docregion inject-form-builder
  private formBuilder = inject(FormBuilder);
  // #enddocregion inject-form-builder
  // #docregion formgroup-compare
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
  // #docregion form-builder
}
// #enddocregion form-builder
