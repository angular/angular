/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, style, transition, trigger} from '@angular/animations';
import {Component, NgModule, ɵNgModuleFactory as NgModuleFactory} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@Component({
  selector: 'app-animations',
  template: `
    <div [@myAnimation]="exp"></div>
    `,
  animations:
      [trigger('myAnimation', [transition('* => on', [animate(1000, style({opacity: 1}))])])]
})
class AnimationsComponent {
  exp: any = false;
}

@Component({
  selector: 'app-root',
  template: `
     <app-animations></app-animations>
   `
})
class RootComponent {
}

@NgModule({
  declarations: [RootComponent, AnimationsComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
})
class AnimationsExampleModule {
  ngDoBootstrap(app: any) {
    app.bootstrap(RootComponent);
  }
}

(window as any).waitForApp =
    platformBrowser().bootstrapModule(AnimationsExampleModule, {ngZone: 'noop'});
