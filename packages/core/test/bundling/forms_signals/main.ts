/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {disabled, form, FormField, required} from '@angular/forms/signals';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-signal-forms',
  imports: [FormField],
  template: `
    <div>
      First Name:
      <input type="text" [formField]="profileForm.firstName" />
    </div>
    <div>
      Last Name:
      <input type="text" [formField]="profileForm.lastName" />
    </div>
    <div>
      Subscribe:
      <input type="checkbox" [formField]="profileForm.subscribed" />
    </div>
    <div>
      Disabled:
      <input [formField]="profileForm.disabledInput" />
    </div>
    @for (address of profileForm.addresses; track address) {
      <div>City: <input [formField]="address.city" /></div>
    }
    <button (click)="addCity()">Add City</button>
  `,
})
class SignalFormsComponent {
  readonly model = signal({
    firstName: '',
    lastName: '',
    subscribed: false,
    disabledInput: '',
    addresses: [{city: ''}],
  });

  readonly profileForm = form(this.model, (p) => {
    required(p.firstName);
    disabled(p.disabledInput);
  });

  addCity(): void {
    this.model.update((m) => ({
      ...m,
      addresses: [...m.addresses, {city: ''}],
    }));
  }
}

@Component({
  selector: 'app-root',
  imports: [SignalFormsComponent],
  template: `<app-signal-forms />`,
})
class RootComponent {}

bootstrapApplication(RootComponent, {providers: [provideZonelessChangeDetection()]});
