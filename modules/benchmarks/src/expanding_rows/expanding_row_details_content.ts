/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Host, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {ExpandingRow} from './expanding_row';
import {expanding_row_css} from './expanding_row_css';

/**
 * This component should be within cfc-expanding-row component. Note that the
 * content is visible only when the row is expanded.
 */
@Component({
  styles: [expanding_row_css],
  selector: 'cfc-expanding-row-details-content',
  template: `
    <div class="cfc-expanding-row-details-content"
        *ngIf="expandingRow.isExpanded">
      <ng-content></ng-content>
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandingRowDetailsContent implements OnDestroy {
  /** Used for unsubscribing to changes in isExpanded parent property. */
  private isExpandedChangeSubscription: Subscription;

  /**
   * We need a reference to parent cfc-expanding-row component to make sure we
   * hide this component if the row is collapsed.
   */
  constructor(@Host() public expandingRow: ExpandingRow, changeDetectorRef: ChangeDetectorRef) {
    this.isExpandedChangeSubscription = this.expandingRow.isExpandedChange.subscribe(() => {
      changeDetectorRef.markForCheck();
    });
  }

  /** Unsubscribe from changes in parent isExpanded property. */
  ngOnDestroy(): void {
    this.isExpandedChangeSubscription.unsubscribe();
  }
}
