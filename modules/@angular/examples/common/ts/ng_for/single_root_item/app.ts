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
    <div *ngFor="let item of items" class="record">
      item <strong>{{ item }}</strong>
    </div>
  `
})
export class ExampleApp {
  items: any[] = [];

  showAll() {
    this.items = [1,2,3,4,5,6,7,8,9,10];
  }

  hideAll() {
    this.items = [];
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
