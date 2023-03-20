/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgOptimizedImageModule} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'fill-mode-passing',
  template: `
    <!-- Make sure an image in the fill mode has the size of a container -->
    <div style="position: absolute; width: 100px; height: 100px;">
      <img ngSrc="/e2e/logo-500w.jpg" fill priority>
    </div>
  `,
})
export class FillModePassingComponent {
}

@NgModule({
  declarations: [FillModePassingComponent],
  imports: [
    NgOptimizedImageModule,
    RouterModule.forChild([{
      path: '',
      component: FillModePassingComponent,
    }]),
  ],
})
export class FillModePassingModule {
}

@Component({
  selector: 'fill-mode-failing',
  template: `
    <div style="position: relative; width: 100%;">
      <img ngSrc="/e2e/logo-500w.jpg" fill priority>
    </div>
  `,
})
export class FillModeFailingComponent {
}

@NgModule({
  declarations: [FillModeFailingComponent],
  imports: [
    NgOptimizedImageModule,
    RouterModule.forChild([{
      path: '',
      component: FillModeFailingComponent,
    }]),
  ],
})
export class FillModeFailingModule {
}
