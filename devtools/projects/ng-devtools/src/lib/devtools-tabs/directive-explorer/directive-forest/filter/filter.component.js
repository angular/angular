/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
/** Default `FilterFn` generator for a generic string search.  */
const genericSearchGenerator = (filter) => {
  return (target) => {
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
let FilterComponent = class FilterComponent {
  constructor() {
    this.filter = output();
    this.nextMatched = output();
    this.prevMatched = output();
    this.matchesCount = input(0);
    this.currentMatch = input(0);
    this.filterFnGenerator = input(genericSearchGenerator);
  }
  emitFilter(event) {
    const filterStr = event.target.value;
    const filterFn = this.filterFnGenerator()(filterStr);
    this.filter.emit(filterFn);
  }
  emitNextMatched() {
    this.nextMatched.emit();
  }
  emitPrevMatched() {
    this.prevMatched.emit();
  }
};
FilterComponent = __decorate(
  [
    Component({
      selector: 'ng-filter',
      templateUrl: './filter.component.html',
      styleUrls: ['./filter.component.scss'],
      imports: [MatIcon],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  FilterComponent,
);
export {FilterComponent};
//# sourceMappingURL=filter.component.js.map
