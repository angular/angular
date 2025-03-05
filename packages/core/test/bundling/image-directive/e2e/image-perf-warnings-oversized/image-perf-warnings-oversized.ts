/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../../../../src/core';

@Component({
  selector: 'image-perf-warnings-oversized',
  standalone: true,
  template: `
      <!-- Image is rendered too small  -->
      <div style="width: 200px; height: 200px">
         <img src="/e2e/logo-1500w.jpg" width="100" height="100">
       </div>
      `,
})
export class ImagePerfWarningsOversizedComponent {}
