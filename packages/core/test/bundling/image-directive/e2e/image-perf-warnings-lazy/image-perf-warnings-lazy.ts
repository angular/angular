/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../../../../src/core';

@Component({
  selector: 'image-perf-warnings-lazy',
  standalone: true,
  template: `
    <!-- 'a.png' should be treated as an LCP element -->
    <img src="/e2e/a.png" width="2500" height="2500" loading="lazy">

    <br>

    <!--
      'b.png' should *not* be treated as an LCP element here
      as well, since it's below the fold
    -->
    <img src="/e2e/b.png" width="10" height="10">
  `,
})
export class ImagePerfWarningsLazyComponent {}
