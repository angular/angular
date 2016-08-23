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

@Component({selector: 'gestures-app', templateUrl: 'template.html'})
class GesturesCmp {
  swipeDirection: string = '-';
  pinchScale: number = 1;
  rotateAngle: number = 0;

  onSwipe(event: any /** TODO #9100 */): void {
    this.swipeDirection = event.deltaX > 0 ? 'right' : 'left';
  }

  onPinch(event: any /** TODO #9100 */): void { this.pinchScale = event.scale; }

  onRotate(event: any /** TODO #9100 */): void { this.rotateAngle = event.rotation; }
}

@NgModule({declarations: [GesturesCmp], bootstrap: [GesturesCmp], imports: [BrowserModule]})
class ExampleModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
