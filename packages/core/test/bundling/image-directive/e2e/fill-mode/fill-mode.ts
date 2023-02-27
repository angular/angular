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
  selector: 'fill-mode-passing',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <!-- Make sure an image in the fill mode has the size of a container -->
    <div style="position: absolute; width: 100px; height: 100px;">
      <img ngSrc="/e2e/logo-500w.jpg" fill priority>
    </div>
  `,
})
export class FillModePassingComponent {
}
@Component({
  selector: 'fill-mode-failing',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <div style="position: relative; width: 100%;">
      <img ngSrc="/e2e/logo-500w.jpg" fill priority>
    </div>
  `,
})
export class FillModeFailingComponent {
}
