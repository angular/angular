/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Input,
  OnDestroy,
} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {ExpandingRow} from './expanding_row';
import {expanding_row_css} from './expanding_row_css';

/**
 * This component should be within cfc-expanding-row component. The caption
 * is only visible when the row is expanded.
 */
@Component({
  selector: 'cfc-expanding-row-details-caption',
  styles: [expanding_row_css],
  template: ` <div
    *ngIf="expandingRow.isExpanded"
    (click)="expandingRow.handleCaptionClick($event)"
    [style.backgroundColor]="color"
    class="cfc-expanding-row-details-caption"
  >
    <ng-content></ng-content>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ExpandingRowDetailsCaption implements OnDestroy {
  /** The background color of this component. */
  @Input() color: string = 'blue';

  /** This is triggered when this component is destroyed. */
  private readonly onDestroy = new Subject<void>();

  /**
   * We need a reference to parent cfc-expanding-row component here to hide
   * this component when the row is collapsed. We also need to relay clicks
   * to the parent component.
   */
  constructor(
    @Host() public expandingRow: ExpandingRow,
    changeDetectorRef: ChangeDetectorRef,
  ) {
    this.expandingRow.isExpandedChange.pipe(takeUntil(this.onDestroy)).subscribe(() => {
      changeDetectorRef.markForCheck();
    });
  }

  /** When component is destroyed, unlisten to isExpanded. */
  ngOnDestroy(): void {
    this.onDestroy.next();
  }
}
