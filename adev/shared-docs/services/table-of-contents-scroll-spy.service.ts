/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ViewportScroller} from '@angular/common';
import {DestroyRef, Injectable, inject, signal} from '@angular/core';
import {TableOfContentsLoader} from './table-of-contents-loader.service';

@Injectable({providedIn: 'root'})
// The service is responsible for listening for scrolling and resizing,
// thanks to which it sets the active item in the Table of contents
export class TableOfContentsScrollSpy {
  private readonly tableOfContentsLoader = inject(TableOfContentsLoader);
  private readonly viewportScroller = inject(ViewportScroller);

  activeItemId = signal<string | null>(null);

  scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  setupActiveItemListener(contentSourceElement: HTMLElement, destroyRef: DestroyRef): void {
    if (contentSourceElement) {
      this.tableOfContentsLoader.setupIntersectionObserver(
        contentSourceElement,
        destroyRef,
        (id) => {
          this.activeItemId.set(id);
        },
      );
    }
  }
}
