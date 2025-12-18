/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {ForLoopInfo} from '../../../../../../../protocol';
import {ObjectTreeExplorerComponent} from '../../../../shared/object-tree-explorer/object-tree-explorer.component';
import {FlatNode} from '../../../../shared/object-tree-explorer/object-tree-types';
import {buildForLoopDataTree} from './for-data-serializer';

@Component({
  templateUrl: './for-view.component.html',
  selector: 'ng-for-view',
  styleUrls: ['./for-view.component.scss'],
  imports: [MatExpansionModule, ObjectTreeExplorerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForViewComponent {
  readonly forLoop = input.required<NonNullable<ForLoopInfo>>();

  readonly collectionNodes = computed<FlatNode[]>(() => {
    return buildForLoopDataTree(this.forLoop().items);
  });

  readonly childrenAccessor = (node: FlatNode): FlatNode[] => node.prop.descriptor.value;
}
