/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, input, output} from '@angular/core';

import {FlatNode} from '../../property-resolver/element-property-resolver';
import {PropertyDataSource} from '../../property-resolver/property-data-source';
import {MatIcon} from '@angular/material/icon';
import {PropertyEditorComponent} from './property-editor.component';
import {PropertyPreviewComponent} from './property-preview.component';
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding} from '@angular/material/tree';

@Component({
  selector: 'ng-property-view-tree',
  templateUrl: './property-view-tree.component.html',
  styleUrls: ['./property-view-tree.component.scss'],
  imports: [
    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    MatTreeNodePadding,
    PropertyPreviewComponent,
    PropertyEditorComponent,
    MatIcon,
  ],
})
export class PropertyViewTreeComponent {
  readonly dataSource = input.required<PropertyDataSource>();
  readonly treeControl = input.required<FlatTreeControl<FlatNode>>();
  readonly updateValue = output<any>();
  readonly inspect = output<any>();

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
}
