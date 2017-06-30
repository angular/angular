/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {MdPaginatorIntl} from './paginator-intl';
import {MATERIAL_COMPATIBILITY_MODE} from '../core';

/**
 * Change event object that is emitted when the user selects a
 * different page size or navigates to another page.
 */
export class PageEvent {
  /** The current page index. */
  pageIndex: number;

  /** The current page size */
  pageSize: number;

  /** The current total number of items being paged */
  length: number;
}

/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
@Component({
  moduleId: module.id,
  selector: 'md-paginator, mat-paginator',
  templateUrl: 'paginator.html',
  styleUrls: ['paginator.css'],
  host: {
    'class': 'mat-paginator',
  },
  providers: [
    {provide: MATERIAL_COMPATIBILITY_MODE, useValue: false}
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdPaginator implements OnInit {
  private _initialized: boolean;

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  @Input() pageIndex: number = 0;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  @Input() length: number = 0;

  /** Number of items to display on a page. By default set to 50. */
  @Input()
  get pageSize(): number { return this._pageSize; }
  set pageSize(pageSize: number) {
    this._pageSize = pageSize;
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSize: number = 50;

  /** The set of provided page size options to display to the user. */
  @Input()
  get pageSizeOptions(): number[] { return this._pageSizeOptions; }
  set pageSizeOptions(pageSizeOptions: number[]) {
    this._pageSizeOptions = pageSizeOptions;
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSizeOptions: number[] = [];

  /** Event emitted when the paginator changes the page size or page index. */
  @Output() page = new EventEmitter<PageEvent>();

  /** Displayed set of page size options. Will be sorted and include current page size. */
  _displayedPageSizeOptions: number[];

  constructor(public _intl: MdPaginatorIntl) { }

  ngOnInit() {
    this._initialized = true;
    this._updateDisplayedPageSizeOptions();
  }

  /** Advances to the next page if it exists. */
  nextPage() {
    if (!this.hasNextPage()) { return; }
    this.pageIndex++;
    this._emitPageEvent();
  }

  /** Move back to the previous page if it exists. */
  previousPage() {
    if (!this.hasPreviousPage()) { return; }
    this.pageIndex--;
    this._emitPageEvent();
  }

  /** Whether there is a previous page. */
  hasPreviousPage() {
    return this.pageIndex >= 1 && this.pageSize != 0;
  }

  /** Whether there is a next page. */
  hasNextPage() {
    const numberOfPages = Math.ceil(this.length / this.pageSize) - 1;
    return this.pageIndex < numberOfPages && this.pageSize != 0;
  }

  /**
   * Changes the page size so that the first item displayed on the page will still be
   * displayed using the new page size.
   *
   * For example, if the page size is 10 and on the second page (items indexed 10-19) then
   * switching so that the page size is 5 will set the third page as the current page so
   * that the 10th item will still be displayed.
   */
  _changePageSize(pageSize: number) {
    // Current page needs to be updated to reflect the new page size. Navigate to the page
    // containing the previous page's first item.
    const startIndex = this.pageIndex * this.pageSize;
    this.pageIndex = Math.floor(startIndex / pageSize) || 0;

    this.pageSize = pageSize;
    this._emitPageEvent();
  }

  /**
   * Updates the list of page size options to display to the user. Includes making sure that
   * the page size is an option and that the list is sorted.
   */
  private _updateDisplayedPageSizeOptions() {
    if (!this._initialized) { return; }

    this._displayedPageSizeOptions = this.pageSizeOptions.slice();
    if (this._displayedPageSizeOptions.indexOf(this.pageSize) == -1) {
      this._displayedPageSizeOptions.push(this.pageSize);
    }

    // Sort the numbers using a number-specific sort function.
    this._displayedPageSizeOptions.sort((a, b) => a - b);
  }

  /** Emits an event notifying that a change of the paginator's properties has been triggered. */
  private _emitPageEvent() {
    this.page.next({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length
    });
  }
}
