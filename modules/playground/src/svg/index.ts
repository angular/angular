/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bootstrap} from '@angular/platform-browser-dynamic';
import {Component} from '@angular/core';

@Component({selector: '[svg-group]', template: `<svg:text x="20" y="20">Hello</svg:text>`})
class SvgGroup {
}


@Component({
  selector: 'svg-app',
  template: `<svg>
    <g svg-group></g>
  </svg>`,
  directives: [SvgGroup]
})
class SvgApp {
}


export function main() {
  bootstrap(SvgApp);
}
