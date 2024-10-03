/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'hello-world-app',
  template: `
    <div>Hello {{ name }}!</div>
  `,
  styles: [
    `
    div {
      font-weight: bold;
    }
  `,
  ],
  standalone: false,
})
export class HelloWorldComponent {
  name: string = 'world';
}
