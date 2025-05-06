/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatCard} from '@angular/material/card';

export type FilterFn = (source: string) => {
  startIdx: number;
  endIdx: number;
} | null;

@Component({
  selector: 'ng-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  imports: [MatCard, MatIcon],
})
export class FilterComponent {
  readonly filter = output<FilterFn>();
  readonly nextMatched = output<void>();
  readonly prevMatched = output<void>();

  readonly matchesCount = input<number>(0);
  readonly currentMatch = input<number>(0);

  emitFilter(event: Event): void {
    const filterStr = (event.target as HTMLInputElement).value;

    const filterFn: FilterFn = (target: string) => {
      if (!filterStr) {
        return null;
      }
      const startIdx = target.toLowerCase().indexOf(filterStr.toLowerCase());

      if (startIdx > -1) {
        return {
          startIdx: startIdx,
          endIdx: startIdx + filterStr.length,
        };
      }
      return null;
    };

    this.filter.emit(filterFn);
  }

  emitNextMatched(): void {
    this.nextMatched.emit();
  }

  emitPrevMatched(): void {
    this.prevMatched.emit();
  }
}
