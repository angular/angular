/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {
  MatTree,
  MatTreeFlattener,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
import {Descriptor, MessageBus, PropType} from '../../../../../../../../protocol';
import {DataSource} from '@angular/cdk/collections';
import {DevtoolsSignalNode, SignalGraphManager} from '../../../signal-graph';
import {arrayifyProps, SignalDataSource} from './signal-data-source';

export interface FlatNode {
  expandable: boolean;
  prop: Property;
  level: number;
}

export interface Property {
  name: string;
  descriptor: Descriptor;
  parent: Property | null;
}

@Component({
  selector: 'ng-signals-value-tree',
  templateUrl: './signals-value-tree.component.html',
  imports: [MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatIcon],
  styleUrl: './signals-value-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsValueTreeComponent {
  private readonly signalGraph = inject(SignalGraphManager);
  private readonly messageBus = inject(MessageBus);

  protected readonly node = input.required<DevtoolsSignalNode>();

  protected readonly treeControl = computed<FlatTreeControl<FlatNode>>(() => {
    return new FlatTreeControl(
      (node) => node.level,
      (node) => node.expandable,
    );
  });

  protected readonly dataSource = computed<DataSource<FlatNode>>(() => {
    const node = this.node();

    return new SignalDataSource(
      node.preview,
      new MatTreeFlattener<Property, FlatNode, FlatNode>(
        (node, level) => ({
          expandable: node.descriptor.expandable,
          prop: node,
          level,
        }),
        (node) => node.level,
        (node) => node.expandable,
        (prop) => {
          const descriptor = prop.descriptor;
          if (descriptor.type === PropType.Object || descriptor.type === PropType.Array) {
            return arrayifyProps(descriptor.value || {}, prop);
          }
          return;
        },
      ),
      this.treeControl(),
      {element: this.signalGraph.element()!, signalId: node.id},
      this.messageBus,
    );
  });

  toggle(node: FlatNode) {
    this.treeControl().toggle(node);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
