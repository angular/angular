/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {form, required} from '@angular/forms/signals';
import {bootstrapApplication} from '@angular/platform-browser';

// Signal forms model only: no directives from `@angular/forms` or `@angular/forms/signals`.
@Component({
  selector: 'app-root',
  template: `{{ f.name().value() }} {{ f.name().valid() }}`,
})
class SignalFormsModelOnly {
  readonly f = form(signal({name: ''}), (p) => {
    required(p.name);
  });
}

bootstrapApplication(SignalFormsModelOnly, {providers: [provideZonelessChangeDetection()]});
