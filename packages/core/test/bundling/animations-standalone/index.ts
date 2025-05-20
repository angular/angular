/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {animate, style, transition, trigger} from '@angular/animations';
import {Component, NgModule, ɵNgModuleFactory as NgModuleFactory} from '../../../src/core';
import {bootstrapApplication, BrowserModule, platformBrowser} from '@angular/platform-browser';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';

@Component({
  selector: 'app-animations',
  template: `
    <div [@myAnimation]="exp"></div>
    `,
  animations: [
    trigger('myAnimation', [transition('* => on', [animate(1000, style({opacity: 1}))])]),
  ],
  standalone: true,
})
class AnimationsComponent {
  exp: any = false;
}

@Component({
  selector: 'app-root',
  template: `
     <app-animations></app-animations>
   `,
  standalone: true,
  imports: [AnimationsComponent],
})
class RootComponent {}

(window as any).waitForApp = bootstrapApplication(RootComponent, {providers: provideAnimations()});
