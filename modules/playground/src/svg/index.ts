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

@Component({selector: '[svg-group]', template: `<svg:text x="20" y="20">Hello</svg:text>`})
export class SvgGroup {
}

@Component({
  selector: 'svg-app',
  template: `<svg>
    <g svg-group></g>
  </svg>`
})
export class SvgApp {
}

@NgModule({bootstrap: [SvgApp], declarations: [SvgApp, SvgGroup], imports: [BrowserModule]})
export class ExampleModule {
}

platformBrowserDynamic().bootstrapModule(ExampleModule);
