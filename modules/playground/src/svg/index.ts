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

@Component({selector: '[svg-group]', template: `<svg:text x="20" y="20">Hello</svg:text>`})
class SvgGroup {
}

@Component({
  selector: 'svg-app',
  template: `<svg>
    <g svg-group></g>
  </svg>`
})
class SvgApp {
}

@NgModule({bootstrap: [SvgApp], declarations: [SvgApp, SvgGroup], imports: [BrowserModule]})
class ExampleModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(ExampleModule);
}
