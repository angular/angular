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
  selector: '[svg-group]',
  template: `<svg:text x="20" y="20">Hello</svg:text>`,
  standalone: false,
})
export class SvgGroup {}

@Component({
  selector: 'svg-app',
  template: `<svg>
    <g svg-group></g>
  </svg>`,
  standalone: false,
})
export class SvgApp {}

@NgModule({bootstrap: [SvgApp], declarations: [SvgApp, SvgGroup], imports: [BrowserModule]})
export class ExampleModule {}

platformBrowser().bootstrapModule(ExampleModule);
