/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkTree} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatTreeNodeOutlet} from './outlet';

// TODO(devversion): workaround for https://github.com/angular/material2/issues/12760
export const _CdkTree = CdkTree;

/**
 * Wrapper for the CdkTable with Material design styles.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tree',
  exportAs: 'matTree',
  template: `<ng-container matTreeNodeOutlet></ng-container>`,
  host: {
    'class': 'mat-tree',
    'role': 'tree',
  },
  styleUrls: ['tree.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: CdkTree, useExisting: MatTree}]
})
export class MatTree<T> extends _CdkTree<T> {
  // Outlets within the tree's template where the dataNodes will be inserted.
  @ViewChild(MatTreeNodeOutlet) _nodeOutlet: MatTreeNodeOutlet;
}

