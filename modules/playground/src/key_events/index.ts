/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

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
export class KeyEventsApp {
  lastKey: string = '(none)';
  shiftEnter: boolean = false;

  onKeyDown(event: KeyboardEvent): void {
    this.lastKey = KeyEventsApp._getEventFullKey(event);
    event.preventDefault();
  }

  onShiftEnter(event: KeyboardEvent): void {
    this.shiftEnter = true;
    event.preventDefault();
  }

  resetShiftEnter(): void {
    this.shiftEnter = false;
  }

  /**
   * Get a more readable version of current pressed keys.
   * @see KeyEventsPlugin.getEventFullKey
   */
  private static _getEventFullKey(event: KeyboardEvent): string {
    const modifierKeys = ['alt', 'control', 'meta', 'shift'];
    const modifierKeyGetters: {[key: string]: (event: KeyboardEvent) => boolean} = {
      'alt': (event: KeyboardEvent) => event.altKey,
      'control': (event: KeyboardEvent) => event.ctrlKey,
      'meta': (event: KeyboardEvent) => event.metaKey,
      'shift': (event: KeyboardEvent) => event.shiftKey
    };

    let fullKey = '';
    let key = event.key.toLowerCase();
    if (key === ' ') {
      key = 'space';  // for readability
    } else if (key === '.') {
      key = 'dot';  // because '.' is used as a separator in event names
    }
    modifierKeys.forEach(modifierName => {
      if (modifierName != key) {
        const modifierGetter = modifierKeyGetters[modifierName];
        if (modifierGetter(event)) {
          fullKey += modifierName + '.';
        }
      }
    });
    return fullKey + key;
  }
}

@NgModule({declarations: [KeyEventsApp], bootstrap: [KeyEventsApp], imports: [BrowserModule]})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
