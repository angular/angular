/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {ForLoopBlock} from '../../../../../../../protocol';
import {ObjectTreeExplorerComponent} from '../../../../shared/object-tree-explorer/object-tree-explorer.component';
import {FlatNode} from '../../../../shared/object-tree-explorer/object-tree-types';
import {buildForLoopDataTree} from './for-loop-data-serializer';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  templateUrl: './for-loop-view.component.html',
  selector: 'ng-for-loop-view',
  styleUrls: ['./for-loop-view.component.scss', '../styles/view-tab.scss'],
  imports: [MatExpansionModule, ObjectTreeExplorerComponent, MatToolbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForLoopViewComponent {
  protected readonly forLoop = input.required<NonNullable<ForLoopBlock>>();

  protected readonly collectionNodes = computed<FlatNode[]>(() =>
    buildForLoopDataTree(this.forLoop().items),
  );

  protected readonly childrenAccessor = (node: FlatNode): FlatNode[] => node.prop.descriptor.value;
}
