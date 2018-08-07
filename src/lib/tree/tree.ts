/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewEncapsulation,
  IterableDiffers,
} from '@angular/core';
import {CdkTree} from '@angular/cdk/tree';
import {MatTreeNodeOutlet} from './outlet';

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
export class MatTree<T> extends CdkTree<T> {
  // Outlets within the tree's template where the dataNodes will be inserted.
  @ViewChild(MatTreeNodeOutlet) _nodeOutlet: MatTreeNodeOutlet;

  // TODO(andrewseguin): Remove this explicitly set constructor when the compiler knows how to
  // properly build the es6 version of the class. Currently sets ctorParameters to empty due to a
  // fixed bug.
  // https://github.com/angular/tsickle/pull/760 - tsickle PR that fixed this
  // https://github.com/angular/angular/pull/23531 - updates compiler-cli to fixed version
  constructor(_differs: IterableDiffers, _changeDetectorRef: ChangeDetectorRef) {
    super(_differs, _changeDetectorRef);
  }
}

