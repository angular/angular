/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
let DeferViewComponent = class DeferViewComponent {
  constructor() {
    this.defer = input.required();
    this.loadingBlockInfo = computed(() => {
      const loadingBlock = this.defer().blocks.loadingBlock;
      if (!loadingBlock) {
        return null;
      }
      const info = [];
      if (loadingBlock.minimumTime) {
        info.push(`minimum ${loadingBlock.minimumTime}ms`);
      }
      if (loadingBlock.afterTime) {
        info.push(`after ${loadingBlock.afterTime}ms`);
      }
      return info.length ? `(${info.join(', ')})` : null;
    });
  }
};
DeferViewComponent = __decorate(
  [
    Component({
      templateUrl: './defer-view.component.html',
      selector: 'ng-defer-view',
      styleUrls: ['./defer-view.component.scss'],
      imports: [MatToolbar],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  DeferViewComponent,
);
export {DeferViewComponent};
//# sourceMappingURL=defer-view.component.js.map
