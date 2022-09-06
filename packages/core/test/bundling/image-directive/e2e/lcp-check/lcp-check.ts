/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgOptimizedImage} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  selector: 'lcp-check',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <!--
      'b.png' should *not* be treated as an LCP element,
      since there is a bigger one right below it
    -->
    <img ngSrc="/e2e/b.png" width="5" height="5">

    <br>

    <!-- 'a.png' should be treated as an LCP element -->
    <img ngSrc="/e2e/a.png" width="2500" height="2500">

    <br>

    <!--
      'b.png' should *not* be treated as an LCP element here
      as well, since it's below the fold
    -->
    <img ngSrc="/e2e/b.png" width="10" height="10">
  `,
})
export class LcpCheckComponent {
}
