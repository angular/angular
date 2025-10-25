/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input, output, ChangeDetectionStrategy} from '@angular/core';
import {ButtonComponent} from '../../shared/button/button.component';
import {JsonPipe} from '@angular/common';
import {RouterTreeNode} from './router-tree-fns';

export type RowType = 'text' | 'chip' | 'flag' | 'list';

@Component({
  standalone: true,
  selector: '[ng-route-details-row]',
  templateUrl: './route-details-row.component.html',
  styleUrls: ['./route-details-row.component.scss'],
  imports: [ButtonComponent, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteDetailsRowComponent {
  readonly label = input.required<string>();
  readonly data = input.required<RouterTreeNode>();
  readonly dataKey = input.required<string>();
  readonly renderValueAsJson = input<boolean>(false);
  readonly type = input<RowType>('text');

  readonly btnClick = output<string>();

  readonly rowValue = computed(() => {
    return this.data()[this.dataKey() as keyof RouterTreeNode];
  });

  readonly dataArray = computed(() => {
    if (!this.data() || !this.dataKey()) {
      return [];
    }

    return this.rowValue();
  });
}
