/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/* tslint:disable:no-console  */
import {Component, Directive, output} from '@angular/core';

// #docregion component-input
@Component({
  selector: 'app-bank-account',
  inputs: ['bankName', 'id: account-id'],
  template: ` Bank Name: {{ bankName }} Account Id: {{ id }} `,
})
export class BankAccountComponent {
  bankName: string | null = null;
  id: string | null = null;

  // this property is not bound, and won't be automatically updated by Angular
  normalizedBankName: string | null = null;
}

@Component({
  selector: 'app-my-input',
  template: ` <app-bank-account bankName="RBC" account-id="4747" /> `,
  imports: [BankAccountComponent],
})
export class MyInputComponent {}
// #enddocregion component-input

// #docregion component-output-interval
@Directive({
  selector: 'app-interval-dir',
})
export class IntervalDirComponent {
  everySecond = output<string>();
  everyFiveSeconds = output<string>();

  constructor() {
    setInterval(() => this.everySecond.emit('event'), 1000);
    setInterval(() => this.everyFiveSeconds.emit('event'), 5000);
  }
}

@Component({
  selector: 'app-my-output',
  template: `
    <app-interval-dir (everySecond)="onEverySecond()" (everyFiveSeconds)="onEveryFiveSeconds()" />
  `,
  imports: [IntervalDirComponent],
})
export class MyOutputComponent {
  onEverySecond() {
    console.log('second');
  }
  onEveryFiveSeconds() {
    console.log('five seconds');
  }
}
// #enddocregion component-output-interval
