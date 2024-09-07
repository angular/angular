/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/* tslint:disable:no-console  */
import {Component, Directive, EventEmitter, NgModule} from '@angular/core';

// #docregion component-input
@Component({
  selector: 'app-bank-account',
  inputs: ['bankName', 'id: account-id'],
  template: `
    Bank Name: {{ bankName }} Account Id: {{ id }}
  `,
  standalone: false,
})
export class BankAccountComponent {
  bankName: string | null = null;
  id: string | null = null;

  // this property is not bound, and won't be automatically updated by Angular
  normalizedBankName: string | null = null;
}

@Component({
  selector: 'app-my-input',
  template: `
    <app-bank-account bankName="RBC" account-id="4747"></app-bank-account>
  `,
  standalone: false,
})
export class MyInputComponent {}
// #enddocregion component-input

// #docregion component-output-interval
@Directive({
  selector: 'app-interval-dir',
  outputs: ['everySecond', 'fiveSecs: everyFiveSeconds'],
  standalone: false,
})
export class IntervalDirComponent {
  everySecond = new EventEmitter<string>();
  fiveSecs = new EventEmitter<string>();

  constructor() {
    setInterval(() => this.everySecond.emit('event'), 1000);
    setInterval(() => this.fiveSecs.emit('event'), 5000);
  }
}

@Component({
  selector: 'app-my-output',
  template: `
    <app-interval-dir
      (everySecond)="onEverySecond()"
      (everyFiveSeconds)="onEveryFiveSeconds()"
    ></app-interval-dir>
  `,
  standalone: false,
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

@NgModule({
  declarations: [BankAccountComponent, MyInputComponent, IntervalDirComponent, MyOutputComponent],
})
export class AppModule {}
