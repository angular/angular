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
import {MatTooltip} from '@angular/material/tooltip';

import {RouterTreeNode} from '../router-tree-fns';
import {ButtonComponent} from '../../../shared/button/button.component';
import {ObjectTreeExplorerComponent} from '../../../shared/object-tree-explorer/object-tree-explorer.component';
import {buildRouteDataTree} from './route-data-serializer';
import {FlatNode} from '../../../shared/object-tree-explorer/object-tree-types';

export type RowType = 'text' | 'flag' | 'list';
export type ActionBtnType = 'none' | 'view-source' | 'navigate';

@Component({
  selector: '[ng-route-details-row]',
  templateUrl: './route-details-row.component.html',
  styleUrls: ['./route-details-row.component.scss'],
  imports: [NgTemplateOutlet, ButtonComponent, MatIcon, MatTooltip, ObjectTreeExplorerComponent],
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
    const rowValue = this.rowValue();
    if (Array.isArray(rowValue)) {
      return rowValue;
    }
    return [];
  });

  // Representation data for object-tree-visualizer
  readonly treeData = computed(() => {
    const rowValue = this.rowValue();
    if (rowValue && this.renderValueAsJson()) {
      // Wrap the data in an object in order to render it as: > {...}
      const value = typeof rowValue === 'object' ? {_root: rowValue} : rowValue;
      return buildRouteDataTree(value);
    }
    return [];
  });

  readonly treeDataChildrenAccessor = (node: FlatNode): FlatNode[] => node.prop.descriptor.value;
}
