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
  ElementRef,
  Host,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {ExpandingRow} from './expanding_row';
import {expanding_row_css} from './expanding_row_css';

const KEY_CODE_TAB = 9;

/**
 * This component should be used within cfc-expanding-row component. Note that
 * summary is visible only when the row is collapsed.
 */
@Component({
  selector: 'cfc-expanding-row-summary',
  styles: [expanding_row_css],
  template: ` <div
    *ngIf="!expandingRow.isExpanded"
    #expandingRowSummaryMainElement
    class="cfc-expanding-row-summary"
    tabindex="-1"
    (click)="expandingRow.handleSummaryClick()"
    (focus)="handleFocus()"
  >
    <ng-content></ng-content>
    <div class="cfc-expanding-row-accessibility-text">.</div>
    <div
      class="cfc-expanding-row-accessibility-text"
      i18n="This is the label used to indicate that the user is in a list of expanding rows."
    >
      Row {{ expandingRow.index + 1 }} in list of expanding rows.
    </div>
    <div
      *ngIf="isPreviouslyFocusedRow()"
      class="cfc-expanding-row-accessibility-text"
      i18n="This is the label used for the first row in list of expanding rows."
    >
      Use arrow keys to navigate.
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ExpandingRowSummary implements OnDestroy {
  /**
   * A reference to the main element. This element should be focusable. We need
   * reference to compute collapsed height of the row. We also use this
   * reference for focus and blur methods below.
   */
  @ViewChild('expandingRowSummaryMainElement') mainElementRef!: ElementRef;

  /** Subscription for changes in parent isExpanded property. */
  private isExpandedSubscription: Subscription;

  /** Subscription for changes in parent index property. */
  private indexSubscription: Subscription;

  /**
   * We need the parent cfc-expanding-row component here to hide this element
   * when the row is expanded. cfc-expanding-row-details-caption element
   * will act as a header for expanded rows. We also need to relay tab-in and
   * click events to the parent.
   */
  constructor(
    @Host() public expandingRow: ExpandingRow,
    changeDetectorRef: ChangeDetectorRef,
  ) {
    this.expandingRow.summaryViewChild = this;
    this.isExpandedSubscription = this.expandingRow.isExpandedChange.subscribe(() => {
      changeDetectorRef.markForCheck();
    });

    this.indexSubscription = this.expandingRow.indexChange.subscribe(() => {
      changeDetectorRef.markForCheck();
    });
  }

  /** When component is destroyed, unlisten to isExpanded. */
  ngOnDestroy(): void {
    if (this.isExpandedSubscription) {
      this.isExpandedSubscription.unsubscribe();
    }
    if (this.indexSubscription) {
      this.indexSubscription.unsubscribe();
    }
  }

  /**
   * Handles focus event on the element. We basically want to detect any focus
   * in this component and relay this information to parent cfc-expanding-row
   * component.
   */
  handleFocus(): void {
    // Clicking causes a focus event to occur before the click event. Filter
    // out click events using the cdkFocusMonitor.
    //
    // TODO(b/62385992) Use the KeyboardFocusService to detect focus cause
    // instead of creating multiple monitors on a page.
    if (
      this.expandingRow.expandingRowMainElement.nativeElement.classList.contains(
        'cdk-mouse-focused',
      )
    ) {
      return;
    }

    if (!this.expandingRow.isFocused && !this.expandingRow.isExpanded) {
      this.expandingRow.handleSummaryFocus();
    }
  }

  /**
   * Handles tab & shift+tab presses on expanding row summaries in case there
   * are tabbable elements inside the summaries.
   */
  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const charCode = event.which || event.keyCode;
    if (charCode === KEY_CODE_TAB) {
      this.handleTabKeypress(event);
    }
  }

  /**
   * Handles tab and shift+tab presses inside expanding row summaries;
   *
   * From inside collapsed row summary:
   * - Tab: If focus was on the last focusable child, should shift focus to
   *        the next focusable element outside the list of expanding rows.
   * - Shift+tab: If focus was on first focusable child, should shift focus to
   *              the main collapsed row summary element
   *              If focus was on main collapsed row summary element, should
   *              shift focus to the last focusable element before the list of
   *              expanding rows.
   */
  handleTabKeypress(event: KeyboardEvent): void {
    const focusableChildren = this.getFocusableChildren();

    if (focusableChildren.length === 0) {
      return;
    }

    // Shift+tab on expanding row summary should focus on last focusable element
    // before expanding row list. Otherwise, if shift+tab is pressed on first
    // focusable child inside expanding row summary, it should focus on main
    // expanding row summary element.
    if (event.shiftKey && document.activeElement === this.mainElementRef.nativeElement) {
      event.preventDefault();
      this.expandingRow.expandingRowHost.focusOnPreviousFocusableElement();
      return;
    } else if (event.shiftKey && document.activeElement === focusableChildren[0]) {
      event.preventDefault();
      this.expandingRow.focus();
    }

    // If tab is pressed on the last focusable element inside an expanding row
    // summary, focus should be set to the next focusable element after the list
    // of expanding rows.
    if (
      !event.shiftKey &&
      document.activeElement === focusableChildren[focusableChildren.length - 1]
    ) {
      event.preventDefault();
      this.expandingRow.expandingRowHost.focusOnNextFocusableElement();
    }
  }

  /**
   * Finds the row that had focus before focus left the list of expanding rows
   * and checks if the current row summary is that row.
   */
  isPreviouslyFocusedRow(): boolean {
    if (!this.expandingRow.expandingRowHost.contentRows) {
      return false;
    }

    const expandingRowHost = this.expandingRow.expandingRowHost;

    if (!this.mainElementRef || !expandingRowHost.lastFocusedRow) {
      return false;
    }

    if (!expandingRowHost.lastFocusedRow.summaryViewChild.mainElementRef) {
      return false;
    }

    // If the current expanding row summary was the last focused one before
    // focus exited the list, then return true to trigger the screen reader
    if (
      this.mainElementRef.nativeElement ===
      expandingRowHost.lastFocusedRow.summaryViewChild.mainElementRef.nativeElement
    ) {
      return true;
    }
    return false;
  }

  /** Puts the DOM focus on the main element. */
  focus(): void {
    if (this.mainElementRef && document.activeElement !== this.mainElementRef.nativeElement) {
      this.mainElementRef.nativeElement.focus();
    }
  }

  /** Removes the DOM focus on the main element. */
  blur(): void {
    if (!this.mainElementRef) {
      return;
    }

    this.mainElementRef.nativeElement.blur();
  }

  /** Returns array of focusable elements within this component. */
  private getFocusableChildren(): HTMLElement[] {
    return [];
  }
}
