/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener} from '@angular/material/tree';
import {DataSource} from '@angular/cdk/collections';

import {MessageBus, PropType} from '../../../../../../../../protocol';
import {DevtoolsSignalNode, SignalGraphManager} from '../../../signal-graph';
import {arrayifyProps, SignalDataSource} from './signal-data-source';
import {ObjectTreeExplorerComponent} from '../../../../../shared/object-tree-explorer/object-tree-explorer.component';
import {FlatNode, Property} from '../../../../../shared/object-tree-explorer/object-tree-types';

@Component({
  selector: 'ng-signal-value-tree',
  templateUrl: './signal-value-tree.component.html',
  imports: [ObjectTreeExplorerComponent],
  styleUrl: './signal-value-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalValueTreeComponent {
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
}
