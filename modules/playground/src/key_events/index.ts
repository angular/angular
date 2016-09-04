/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
// TODO: remove deep import by reimplementing the event name serialization
import {KeyEventsPlugin} from '@angular/platform-browser/src/dom/events/key_events';

@Component({
  selector: 'key-events-app',
  template: `Click in the following area and press a key to display its name:<br>
  <div (keydown)="onKeyDown($event)" class="sample-area" tabindex="0">{{lastKey}}</div><br>
  Click in the following area and press shift.enter:<br>
  <div
    (keydown.shift.enter)="onShiftEnter($event)"
    (click)="resetShiftEnter()"
    class="sample-area"
    tabindex="0"
  >{{shiftEnter ? 'You pressed shift.enter!' : ''}}</div>`
})
class KeyEventsApp {
  lastKey: string = '(none)';
  shiftEnter: boolean = false;

  onKeyDown(event: any /** TODO #9100 */): void {
    this.lastKey = KeyEventsPlugin.getEventFullKey(event);
    event.preventDefault();
  }

  onShiftEnter(event: any /** TODO #9100 */): void {
    this.shiftEnter = true;
    event.preventDefault();
  }

  resetShiftEnter(): void { this.shiftEnter = false; }
}

@NgModule({declarations: [KeyEventsApp], bootstrap: [KeyEventsApp], imports: [BrowserModule]})
class ExampleModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
