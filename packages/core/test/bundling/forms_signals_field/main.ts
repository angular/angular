/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {bootstrapApplication} from '@angular/platform-browser';

// Signal forms model plus the `FormField` directive on a native input.
@Component({
  selector: 'app-root',
  imports: [FormField],
  template: `<input [formField]="f.name" /> {{ f.name().valid() }}`,
})
class SignalFormsWithField {
  readonly f = form(signal({name: ''}), (p) => {
    required(p.name);
  });
}

bootstrapApplication(SignalFormsWithField, {providers: [provideZonelessChangeDetection()]});
