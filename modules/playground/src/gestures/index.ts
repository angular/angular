/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'gestures-app',
  templateUrl: 'template.html',
  standalone: false,
})
class GesturesCmp {
  swipeDirection: string = '-';
  pinchScale: number = 1;
  rotateAngle: number = 0;

  onSwipe(event: Event): void {
    this.swipeDirection = (event as unknown as HammerInput).deltaX > 0 ? 'right' : 'left';
  }

  onPinch(event: Event): void {
    this.pinchScale = (event as unknown as HammerInput).scale;
  }

  onRotate(event: Event): void {
    this.rotateAngle = (event as unknown as HammerInput).rotation;
  }
}

@NgModule({declarations: [GesturesCmp], bootstrap: [GesturesCmp], imports: [BrowserModule]})
class ExampleModule {}

platformBrowser().bootstrapModule(ExampleModule);
