/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

export type FilterMatch = {
  startIdx: number;
  endIdx: number;
};

export type FilterFn = (source: string) => FilterMatch[];

/** Describes the filtering strategy of the `ng-filter` by providing a generator for the `FilterFn`. */
export type FilterFnGenerator = (filter: string) => FilterFn;

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

@Component({
  selector: 'ng-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  imports: [MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent {
  readonly filter = output<FilterFn>();
  readonly nextMatched = output<void>();
  readonly prevMatched = output<void>();

  readonly matchesCount = input<number>(0);
  readonly currentMatch = input<number>(0);

  readonly filterFnGenerator = input<FilterFnGenerator>(genericSearchGenerator);

  emitFilter(event: Event): void {
    const filterStr = (event.target as HTMLInputElement).value;
    const filterFn = this.filterFnGenerator()(filterStr);

    this.filter.emit(filterFn);
  }

  emitNextMatched(): void {
    this.nextMatched.emit();
  }

  emitPrevMatched(): void {
    this.prevMatched.emit();
  }
}
