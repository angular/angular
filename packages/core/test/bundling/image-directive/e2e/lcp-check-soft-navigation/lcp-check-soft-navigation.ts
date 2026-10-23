/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgOptimizedImage} from '@angular/common';
import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'lcp-check-soft-navigation-start',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <img ngSrc="/e2e/b.png" width="5" height="5" priority />
    <a id="navigate-to-soft-navigation-lcp" routerLink="/e2e/lcp-check-soft-navigation-target">
      Navigate
    </a>
  `,
})
export class LcpCheckSoftNavigationStart {}

@Component({
  selector: 'lcp-check-soft-navigation-target',
  imports: [NgOptimizedImage],
  template: `
    <button id="render-image-without-navigation" (click)="showNonNavigationImage.set(true)">
      Render image
    </button>

    @if (showNonNavigationImage()) {
      <img id="non-navigation-image" ngSrc="/e2e/logo-500w.jpg" width="500" height="500" />
    } @else {
      <img id="soft-navigation-lcp" ngSrc="/e2e/logo-1500w.jpg" width="1500" height="1500" />
    }
  `,
})
export class LcpCheckSoftNavigationTarget {
  showNonNavigationImage = signal(false);
}
