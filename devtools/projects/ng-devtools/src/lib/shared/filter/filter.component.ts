/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ElementRef, input, output, viewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

export type FilterMatch = {
  startIdx: number;
  endIdx: number;
};

/** Performs filtering of a provided source (default: string) and responds with matches. */
export type FilterFn<T = string> = (source: T) => FilterMatch[];

/** Describes the filtering strategy of the `ng-filter` by providing a generator for the `FilterFn`. */
export type FilterFnGenerator<T = string> = (filter: string) => FilterFn<T>;

/** Default `FilterFn` generator for a generic string search.  */
const genericSearchGenerator: FilterFnGenerator = (filter: string) => {
  return (target: string) => {
    if (!filter) {
      return [];
    }
    const startIdx = target.toLowerCase().indexOf(filter.toLowerCase());

    if (startIdx > -1) {
      return [
        {
          startIdx: startIdx,
          endIdx: startIdx + filter.length,
        },
      ];
    }
    return [];
  };
};

/**
 * Generic filter input.
 *
 * Supported CSS variables:
 * --ng-filter-background - Input background.
 * --ng-filter-border-radius - Input border radius.
 * --ng-filter-width - Width of the input (Note: text area, excl. controls).
 * --ng-filter-height - Height of the input.
 * --ng-filter-icon-display – Use to change the display mode of the magnifier icon (e.g. `none` to hide).
 * --ng-filter-placeholder-color - Color of the input placeholder.
 * --ng-filter-outline - Input outline enabled when focused.
 */
@Component({
  selector: 'ng-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  imports: [MatIcon, MatTooltip],
})
export class FilterComponent {
  protected readonly input = viewChild.required<ElementRef>('input');

  /** Filter event emitted on input typing. Responds with a `FilterFn`. */
  readonly filter = output<FilterFn<unknown>>();

  /** Emitted when the next match is requested. */
  readonly nextMatched = output<void>();

  /** Emitted when the previous match is requested. */
  readonly prevMatched = output<void>();

  /** Total number of matches that resulted from the current filtering. */
  readonly matchesCount = input(0);

  /** Current match index relative to the matches array. */
  readonly currentMatch = input(0);

  /** Filter input debounce. */
  readonly debounce = input(0);

  /** Filter input placeholder. */
  readonly placeholder = input('Search');

  /**
   * `FilterFn` generator. Use when you want to introduce instance-specific
   * filtering logic and syntax. Default: generic string matching.
   */
  readonly filterFnGenerator = input<FilterFnGenerator<any>>(genericSearchGenerator);

  private debounceTimeout?: ReturnType<typeof setTimeout>;

  emitFilter(filterStr: string): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      const filterFn = this.filterFnGenerator()(filterStr);
      this.filter.emit(filterFn);
    }, this.debounce());
  }

  emitNextMatched(): void {
    this.nextMatched.emit();
  }

  emitPrevMatched(): void {
    this.prevMatched.emit();
  }

  clearFilter(): void {
    this.input().nativeElement.value = '';
    this.emitFilter('');
  }
}
