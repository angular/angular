/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Input, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TableOfContentsLevel} from '../../interfaces/index';
import {TableOfContentsLoader} from '../../services/table-of-contents-loader.service';
import {TableOfContentsScrollSpy} from '../../services/table-of-contents-scroll-spy.service';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'docs-table-of-contents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss'],
  imports: [RouterLink, IconComponent],
})
export class TableOfContents {
  // Element that contains the content from which the Table of Contents is built
  @Input({required: true}) contentSourceElement!: HTMLElement;

  private readonly scrollSpy = inject(TableOfContentsScrollSpy);
  private readonly tableOfContentsLoader = inject(TableOfContentsLoader);
  tableOfContentItems = this.tableOfContentsLoader.tableOfContentItems;

  activeItemId = this.scrollSpy.activeItemId;
  shouldDisplayScrollToTop = computed(() => !this.scrollSpy.scrollbarThumbOnTop());
  TableOfContentsLevel = TableOfContentsLevel;

  ngAfterViewInit() {
    this.tableOfContentsLoader.buildTableOfContent(this.contentSourceElement);
    this.scrollSpy.startListeningToScroll(this.contentSourceElement);
  }

  scrollToTop(): void {
    this.scrollSpy.scrollToTop();
  }
}
