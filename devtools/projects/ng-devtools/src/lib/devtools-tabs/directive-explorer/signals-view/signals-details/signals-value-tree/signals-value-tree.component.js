/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
let SignalsValueTreeComponent = class SignalsValueTreeComponent {
  constructor() {
    this.treeControl = input.required();
    this.dataSource = input.required();
    this.hasChild = (_, node) => node.expandable;
  }
  toggle(node) {
    this.treeControl().toggle(node);
  }
};
SignalsValueTreeComponent = __decorate(
  [
    Component({
      selector: 'ng-signals-value-tree',
      templateUrl: './signals-value-tree.component.html',
      imports: [MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatIcon],
      styleUrl: './signals-value-tree.component.scss',
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  SignalsValueTreeComponent,
);
export {SignalsValueTreeComponent};
//# sourceMappingURL=signals-value-tree.component.js.map
