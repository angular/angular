/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵIMAGE_LOADER as IMAGE_LOADER, ɵNgOptimizedImage as NgOptimizedImage} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <img rawSrc="./a.png" width="150" height="150">
  `,
})
class RootComponent {
  constructor() {}
}

@NgModule({
  declarations: [RootComponent],
  imports: [BrowserModule, NgOptimizedImage],
  bootstrap: [RootComponent],
  providers: [{provide: IMAGE_LOADER, useValue: () => 'b.png'}],
})
class ImageDirectiveExampleModule {
}

(window as any).waitForApp =
    platformBrowser().bootstrapModule(ImageDirectiveExampleModule, {ngZone: 'noop'});
