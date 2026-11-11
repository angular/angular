/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {compatForm} from '@angular/forms/signals/compat';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-compat-forms',
  template: `
    <p>Valid: {{ profileForm.name().valid() }}</p>
    <p>Errors: {{ profileForm.name().errors().length }}</p>
  `,
})
class CompatFormsComponent {
  readonly model = signal({
    name: new FormControl('', Validators.required),
  });

  readonly profileForm = compatForm(this.model);
}

@Component({
  selector: 'app-root',
  imports: [CompatFormsComponent],
  template: `<app-compat-forms />`,
})
class RootComponent {}

bootstrapApplication(RootComponent);
