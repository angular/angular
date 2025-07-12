/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
import {Descriptor} from '../../../../../../protocol';
import {DataSource} from '@angular/cdk/collections';

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
  readonly treeControl = input.required<FlatTreeControl<FlatNode>>();
  readonly dataSource = input.required<DataSource<FlatNode>>();

  toggle(node: FlatNode) {
    this.treeControl().toggle(node);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
