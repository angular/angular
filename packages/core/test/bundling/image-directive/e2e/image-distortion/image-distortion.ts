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
  selector: 'image-distortion-passing',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
     <!-- All the images in this template should not throw -->
     <!-- This image is here for the sake of making sure the "LCP image is priority" assertion is passed -->
     <img ngSrc="/e2e/logo-500w.jpg" width="500" height="500" priority>
     <br>
     <!-- width and height attributes exactly match the intrinsic size of image -->
     <img ngSrc="/e2e/a.png" width="25" height="25">
     <br>
     <!-- supplied aspect ratio exactly matches intrinsic aspect ratio-->
     <img ngSrc="/e2e/a.png" width="250" height="250">
     <img ngSrc="/e2e/b.png" width="40" height="40">
     <img ngSrc="/e2e/b.png" width="240" height="240">
     <br>
     <!-- supplied aspect ratio is similar to intrinsic aspect ratio -->
     <!-- Aspect-ratio: 0.93333333333 -->
     <img ngSrc="/e2e/b.png" width="28" height="30">
     <!-- Aspect-ratio: 0.9 -->
     <img ngSrc="/e2e/b.png" width="27" height="30">
     <!-- Aspect-ratio: 1.09375 -->
     <img ngSrc="/e2e/b.png" width="350" height="320">
     <!-- Aspect-ratio: 1.0652173913 -->
     <img ngSrc="/e2e/b.png" width="245" height="230">
     <br>
     <!-- Fill mode disables aspect ratio warning -->
     <!-- Aspect-ratio: 0.1 -->
     <img ngSrc="/e2e/b.png" width="24" height="240" disableOptimizedSrcset fill>
     <br>
     <!-- Supplied aspect ratio is correct & image has 0x0 rendered size -->
     <img ngSrc="/e2e/a.png" width="25" height="25" style="display: none">
     <br>
     <!-- styling is correct -->
     <img ngSrc="/e2e/a.png" width="25" height="25" style="width: 100%; height: 100%">
     <img ngSrc="/e2e/a.png" width="250" height="250" style="max-width: 100%; height: 100%">
     <img ngSrc="/e2e/a.png" width="25" height="25" style="height: 25%; width: 25%;">
     <br>
    `,
})
export class ImageDistortionPassingComponent {
}
@Component({
  selector: 'image-distortion-failing',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
     <!-- With the exception of the priority image, all the images in this template should throw -->
     <!-- This image is here for the sake of making sure the "LCP image is priority" assertion is passed -->
     <img ngSrc="/e2e/logo-500w.jpg" width="500" height="500" priority>
     <br>
     <!-- These images should throw -->
     <!-- Supplied aspect ratio differs from intrinsic aspect ratio by > .1 -->
     <!-- Aspect-ratio: 0.86666666666 -->
     <img ngSrc="/e2e/b.png" width="26" height="30" disableOptimizedSrcset>
     <!-- Aspect-ratio: 0.1 -->
     <img ngSrc="/e2e/b.png" width="24" height="240" disableOptimizedSrcset>
     <!-- Supplied aspect ratio is incorrect & image has 0x0 rendered size -->
     <img ngSrc="/e2e/a.png" width="222" height="25" style="display: none" disableOptimizedSrcset>
     <br>
     <!-- Image styling is causing distortion -->
     <div style="width: 300px; height: 300px">
       <img ngSrc="/e2e/b.png" width="250" height="250" style="width: 10%" disableOptimizedSrcset>
       <img ngSrc="/e2e/b.png" width="250" height="250" style="max-height: 10%" disableOptimizedSrcset>
       <!-- Images dimensions are incorrect AND image styling is incorrect -->
       <img ngSrc="/e2e/b.png" width="150" height="250" style="max-height: 10%" disableOptimizedSrcset>
     </div>
     `,
})
export class ImageDistortionFailingComponent {
}
