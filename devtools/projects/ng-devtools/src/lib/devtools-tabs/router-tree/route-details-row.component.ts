/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input, output, ChangeDetectionStrategy} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {ButtonComponent} from '../../shared/button/button.component';
import {RouterTreeNode} from './router-tree-fns';
import {MatTooltip} from '@angular/material/tooltip';
import {RouteDataTreeComponent} from './route-data-tree/route-data-tree.component';

export type RowType = 'text' | 'flag' | 'list';
export type ActionBtnType = 'none' | 'view-source' | 'navigate';

@Component({
  selector: '[ng-route-details-row]',
  templateUrl: './route-details-row.component.html',
  styleUrls: ['./route-details-row.component.scss'],
  imports: [NgTemplateOutlet, ButtonComponent, MatIcon, MatTooltip, RouteDataTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteDetailsRowComponent {
  readonly label = input.required<string>();
  readonly data = input.required<RouterTreeNode>();
  readonly dataKey = input.required<string>();
  readonly renderValueAsJson = input(false);
  readonly type = input<RowType>('text');
  readonly actionBtnType = input<ActionBtnType>('none');
  readonly actionBtnTooltip = input<string>('');
  readonly actionBtnDisabled = input(false);

  readonly actionBtnClick = output<string>();

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
