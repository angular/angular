/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Component
import {Component, NgModule, animate, state, style, transition, trigger} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'example-app',
  template: `
    <nav class="actions">
      <button class="button" (click)="showAll()">Show All Items</button> 
      <button class="button" (click)="hideAll()">Hide All Items</button> 
    </nav>
    <div
      *ngFor="let item of items; let index=index; let first=first; let last=last; let even=even; let odd=odd;"
      [attr.class]="resolveClassName(first, last, even, odd)">
      
      <h1>{{ index + 1 }}</h1>
      <p>{{ item }}</p>
      
      <sup *ngIf="first">
        New Years Resolutions...
      </sup>
      
      <sup *ngIf="last">
        Yaaaay holidays!
      </sup>
    </div>
  `
})
export class ExampleApp {
  items: any[] = [];

  showAll() {
    this.items = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  }

  hideAll() {
    this.items = [];
  }

  resolveClassName(first: boolean, last:boolean, even: boolean, odd: boolean): string {
    var className = 'cell';
    if (first) className += ' first-record';
    else if (last) className += ' last-record';
    else if (even) className += ' even-record';
    else if (odd) className += ' odd-record';
    return className;
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [ExampleApp],
  bootstrap: [ExampleApp]
})
export class AppModule {
}

// #enddocregion
