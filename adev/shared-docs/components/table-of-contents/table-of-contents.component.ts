/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  input,
  inject,
  afterNextRender,
} from '@angular/core';
import {Location} from '@angular/common';
import {TableOfContentsLevel} from '../../interfaces/index';
import {TableOfContentsLoader} from '../../services/table-of-contents-loader.service';
import {TableOfContentsScrollSpy} from '../../services/table-of-contents-scroll-spy.service';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'docs-table-of-contents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss'],
  imports: [IconComponent],
})
export class TableOfContents {
  // Element that contains the content from which the Table of Contents is built
  readonly contentSourceElement = input.required<HTMLElement>();
  readonly location = inject(Location);

  private readonly scrollSpy = inject(TableOfContentsScrollSpy);
  private readonly tableOfContentsLoader = inject(TableOfContentsLoader);
  private readonly destroyRef = inject(DestroyRef);

  tableOfContentItems = this.tableOfContentsLoader.tableOfContentItems;

  activeItemId = this.scrollSpy.activeItemId;
  TableOfContentsLevel = TableOfContentsLevel;

  constructor() {
    afterNextRender({
      read: () => {
        this.tableOfContentsLoader.buildTableOfContent(this.contentSourceElement());
        this.scrollSpy.setupActiveItemListener(this.contentSourceElement(), this.destroyRef);
      },
    });
  }

  scrollToTop(): void {
    this.scrollSpy.scrollToTop();
  }
}
