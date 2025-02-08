/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';

// #docregion longform
@Component({
  selector: 'app-root',
  template: `
    <h1>Hello World!</h1>
    <span class="red">Shadow DOM Rocks!</span>
  `,
  styles: [
    `
      :host {
        display: block;
        border: 1px solid black;
      }
      h1 {
        color: blue;
      }
      .red {
        background-color: red;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
class MyApp {}
// #enddocregion
