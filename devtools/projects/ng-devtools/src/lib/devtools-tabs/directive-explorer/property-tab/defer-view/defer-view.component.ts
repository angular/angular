/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {DeferInfo} from '../../../../../../../protocol';

@Component({
  templateUrl: './defer-view.component.html',
  selector: 'ng-defer-view',
  styleUrls: ['./defer-view.component.scss'],
  imports: [MatToolbar],
})
export class DeferViewComponent {
  readonly defer = input.required<NonNullable<DeferInfo>>();

  readonly loadingBlockInfo = computed(() => {
    const loadingBlock = this.defer().blocks.loadingBlock;
    if (!loadingBlock) {
      return null;
    }

    const info: string[] = [];
    if (loadingBlock.minimumTime) {
      info.push(`minimum ${loadingBlock.minimumTime}ms`);
    }
    if (loadingBlock.afterTime) {
      info.push(`after ${loadingBlock.afterTime}ms`);
    }
    return info.length ? `(${info.join(', ')})` : null;
  });
}
