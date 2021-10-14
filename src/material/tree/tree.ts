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

/**
 * Wrapper for the CdkTable with Material design styles.
 */
@Component({
  selector: 'mat-tree',
  exportAs: 'matTree',
  template: `<ng-container matTreeNodeOutlet></ng-container>`,
  host: {
    // The 'cdk-tree' class needs to be included here because classes set in the host in the
    // parent class are not inherited with View Engine. The 'cdk-tree' class in CdkTreeNode has
    // to be set in the host because:
    // if it is set as a @HostBinding it is not set by the time the tree nodes try to read the
    // class from it.
    // the ElementRef is not available in the constructor so the class can't be applied directly
    // without a breaking constructor change.
    'class': 'mat-tree cdk-tree',
    'role': 'tree',
  },
  styleUrls: ['tree.css'],
  encapsulation: ViewEncapsulation.None,
  // See note on CdkTree for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkTree, useExisting: MatTree}],
})
export class MatTree<T, K = T> extends CdkTree<T, K> {
  // Outlets within the tree's template where the dataNodes will be inserted.
  @ViewChild(MatTreeNodeOutlet, {static: true}) override _nodeOutlet: MatTreeNodeOutlet;
}
