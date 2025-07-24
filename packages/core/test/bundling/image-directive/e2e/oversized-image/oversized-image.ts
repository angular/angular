/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IMAGE_LOADER, ImageLoaderConfig, NgOptimizedImage} from '@angular/common';
import {Component} from '../../../../../src/core';

const imageLoader = {
  provide: IMAGE_LOADER,
  useFactory: () => (config: ImageLoaderConfig) => config.src,
};

@Component({
  selector: 'oversized-image-passing',
  standalone: true,
  imports: [NgOptimizedImage],
  providers: [imageLoader],
  template: `
      <!-- Image is rendered within threshold range-->
      <div style="width: 500px; height: 500px">
        <img ngSrc="/e2e/logo-500w.jpg" width="200" height="200" priority>
      </div>
      <!-- Image is rendered too small but ngSrcset set-->
      <div style="width: 300px; height: 300px">
        <img ngSrc="/e2e/logo-1500w.jpg" width="100" height="100" priority
            ngSrcset="100w, 200w">
      </div>
     `,
})
export class OversizedImageComponentPassing {}

@Component({
  selector: 'oversized-image-failing',
  standalone: true,
  imports: [NgOptimizedImage],
  providers: [imageLoader],
  template: `
      <!-- Image is rendered too small  -->
      <div style="width: 300px; height: 300px">
         <img ngSrc="/e2e/logo-1500w.jpg" width="100" height="100" priority disableOptimizedSrcset>
       </div>
      `,
})
export class OversizedImageComponentFailing {}
