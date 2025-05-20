/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {FlatTreeControl} from '@angular/cdk/tree';

import {FlatNode} from '../../property-resolver/element-property-resolver';
import {PropertyDataSource} from '../../property-resolver/property-data-source';
import {PropertyEditorComponent} from './property-editor.component';
import {PropertyPreviewComponent} from './property-preview.component';
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding} from '@angular/material/tree';

@Component({
  selector: 'ng-property-view-tree',
  templateUrl: './property-view-tree.component.html',
  styleUrls: ['./property-view-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
  readonly dataSource = input.required<PropertyDataSource>();
  readonly treeControl = input.required<FlatTreeControl<FlatNode>>();
  readonly updateValue = output<any>();
  readonly inspect = output<any>();
  readonly showSignalGraph = output<FlatNode>();

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

  isSignal(node: FlatNode) {
    return node.prop.descriptor.containerType?.includes('Signal');
  }

  showGraph(event: Event, node: FlatNode) {
    event.stopPropagation();
    this.showSignalGraph.emit(node);
  }
}
