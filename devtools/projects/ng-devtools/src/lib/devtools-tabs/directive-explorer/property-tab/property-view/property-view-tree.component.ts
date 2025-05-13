/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {FlatTreeControl} from '@angular/cdk/tree';

import {FlatNode} from '../../property-resolver/element-property-resolver';
import {PropertyDataSource} from '../../property-resolver/property-data-source';
import {PropertyEditorComponent} from './property-editor.component';
import {PropertyPreviewComponent} from './property-preview.component';
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding} from '@angular/material/tree';
import {SUPPORTED_APIS} from '../../../../application-providers/supported_apis';
import {SignalGraphManager} from '../../signal-graph/signal-graph-manager';
import {DebugSignalGraphNode} from '../../../../../../../protocol';

interface PropertyFlatNode extends FlatNode {
  isSignal: boolean;
  signalGraphNode?: DebugSignalGraphNode;
}

@Component({
  selector: 'ng-property-view-tree',
  templateUrl: './property-view-tree.component.html',
  styleUrls: ['./property-view-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    MatTreeNodePadding,
    PropertyPreviewComponent,
    PropertyEditorComponent,
    MatIcon,
    MatTooltip,
  ],
})
export class PropertyViewTreeComponent {
  protected readonly supportedApis = inject(SUPPORTED_APIS);
  private readonly signalGraph = inject(SignalGraphManager);

  readonly dataSource = input.required<PropertyDataSource>();
  readonly treeControl = input.required<FlatTreeControl<FlatNode>>();
  readonly signalGraphEnabled = input.required<boolean>();
  readonly updateValue = output<any>();
  readonly inspect = output<any>();
  readonly showSignalGraph = output<DebugSignalGraphNode>();

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  toggle(node: FlatNode): void {
    if (this.treeControl().isExpanded(node)) {
      this.treeControl().collapse(node);
      return;
    }
    this.expand(node);
  }

  expand(node: FlatNode): void {
    const {prop} = node;
    if (!prop.descriptor.expandable) {
      return;
    }
    this.treeControl().expand(node);
  }

  handleUpdate(node: FlatNode, newValue: unknown): void {
    this.updateValue.emit({
      node,
      newValue,
    });
  }

  getSignalNode(node: FlatNode): DebugSignalGraphNode | null {
    if (node.prop.descriptor.containerType?.includes('Signal')) {
      return this.signalGraph.graph()?.nodes.find((sn) => sn.label === node.prop.name) ?? null;
    }
    return null;
  }

  showGraph(event: Event, node: DebugSignalGraphNode) {
    event.stopPropagation();
    this.showSignalGraph.emit(node);
  }
}
