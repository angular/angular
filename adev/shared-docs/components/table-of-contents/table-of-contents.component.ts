/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location, ViewportScroller} from '@angular/common';
import {afterNextRender, Component, DestroyRef, inject, input, signal} from '@angular/core';
import {TableOfContentsLevel} from '../../interfaces/index';
import {TableOfContentsLoader} from '../../services';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'docs-table-of-contents',
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss'],
  imports: [IconComponent],
})
export class TableOfContents {
  // Element that contains the content from which the Table of Contents is built
  readonly contentSourceElement = input.required<HTMLElement>();
  readonly location = inject(Location);

  private readonly tableOfContentsLoader = inject(TableOfContentsLoader);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly destroyRef = inject(DestroyRef);

  tableOfContentItems = this.tableOfContentsLoader.tableOfContentItems;

  readonly activeItemId = signal<string | null>(null);
  TableOfContentsLevel = TableOfContentsLevel;

  constructor() {
    afterNextRender({
      read: () => {
        this.tableOfContentsLoader.buildTableOfContent(this.contentSourceElement());
        this.setupActiveItemListener(this.contentSourceElement());
      },
    });
  }

  scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  setupActiveItemListener(contentSourceElement: HTMLElement): void {
    if (contentSourceElement) {
      this.tableOfContentsLoader.setupIntersectionObserver(
        contentSourceElement,
        this.destroyRef,
        (id) => {
          this.activeItemId.set(id);
        },
      );
    }
  }
}
