/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {
  EXPANDING_ROW_HOST_INJECTION_TOKEN,
  ExpandingRow,
  ExpandingRowHostBase,
} from './expanding_row';

/**
 * We use this class in <cfc-expanding-row/> template to identify the row.
 * The [cfcExpandingRowHost] directive also uses this class to check if a given
 * HTMLElement is within an <cfc-expanding-row/>.
 */
const EXPANDING_ROW_CLASS_NAME = 'cfc-expanding-row';

/** Throttle duration in milliseconds for repeated key presses. */
export const EXPANDING_ROW_KEYPRESS_THORTTLE_MS = 50;

/**
 * This type union is created to make arguments of handleUpOrDownPress*
 * methods in ExpandingRowHost class more readable.
 */
type UpOrDown = 'up' | 'down';

/**
 * This is the wrapper directive for the cfc-expanding-row components. Note that
 * we wanted to make this a directive instead of component because child
 * cfc-expanding-row components does not have to be a direct child.
 */
@Component({
  selector: 'cfc-expanding-row-host',
  template: ` <div #firstFocusable (focus)="focusOnLastFocusedRow()" tabindex="0"></div>
    <ng-content></ng-content>
    <div #lastFocusable (focus)="focusOnLastFocusedRow()" tabindex="0"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: EXPANDING_ROW_HOST_INJECTION_TOKEN, useExisting: ExpandingRowHost}],
  standalone: false,
})
export class ExpandingRowHost implements AfterViewInit, OnDestroy, ExpandingRowHostBase {
  /**
   * An HTML selector (e.g. "body") for the scroll element. We need this to
   * make some scroll adjustments.
   */
  @Input() scrollElementSelector = '.cfc-panel-body-scrollable';

  /**
   * An HTML selector (e.g. "body") for the click root. While the row is
   * expanded, and user clicks outside of the expanded row, we collapse this row
   * But to do this, we need to know the clickable area.
   */
  @Input() clickRootElementSelector = 'cfc-panel-body';

  /**
   * The @Output will be triggered when the user wants to focus on the
   * previously expanded row, and we are already at the first row. The logs team
   * will use this to prepend data on demand.
   */
  @Output() onPrepend = new EventEmitter<void>();

  /** A reference to the last focusable element in list of expanding rows. */
  @ViewChild('lastFocusable', {static: true}) lastFocusableElement!: ElementRef;

  /** A reference to the first focusable element in list of expanding rows. */
  @ViewChild('firstFocusable', {static: true}) firstFocusableElement!: ElementRef;

  /**
   * A reference to all child cfc-expanding-row elements. We will need for
   * keyboard accessibility and scroll adjustments. For example, we need to know
   * which row is previous row when user presses "left arrow" on a focused row.
   */
  @ContentChildren(forwardRef(() => ExpandingRow), {descendants: true})
  contentRows!: QueryList<ExpandingRow>;

  /**
   * Keeps track of the last row that had focus before focus left the list
   * of expanding rows.
   */
  lastFocusedRow?: ExpandingRow = undefined;

  /**
   * Focused rows just show a blue left border. This node is not expanded. We
   * need to keep a reference to the focused row to unfocus when another row
   * is focused.
   */
  private focusedRow?: ExpandingRow = undefined;

  /**
   * This is the expanded row. If there is an expanded row there shouldn't be
   * any focused rows. We need a reference to this. For example we need to
   * collapse the currently expanded row, if another row is expanded.
   */
  private expandedRow?: ExpandingRow = undefined;

  /**
   * This is just handleRootMouseUp.bind(this). handleRootMouseUp handles
   * click events on root element (defined by clickRootElementSelector @Input)
   * Since we attach the click listener dynamically, we need to keep this
   * function around. This enables us to detach the click listener when
   * component is destroyed.
   */
  private handleRootMouseUpBound = this.handleRootMouseUp.bind(this);

  /**
   * 16px is the margin animation we have on cfc-expanding-row component.
   * We need this value to compute scroll adjustments.
   */
  private static rowMargin = 16;

  /** Subscription to changes in the expanding rows. */
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  private rowChangeSubscription!: Subscription;

  /**
   * When component initializes we need to attach click listener to the root
   * element. This click listener will allows us to collapse the
   * currently expanded row when user clicks outside of it.
   */
  ngAfterViewInit(): void {
    const clickRootElement: HTMLElement = this.getClickRootElement();

    if (!clickRootElement) {
      return;
    }

    clickRootElement.addEventListener('mouseup', this.handleRootMouseUpBound);

    this.rowChangeSubscription = this.contentRows.changes.subscribe(() => {
      this.recalcRowIndexes();
    });
    this.recalcRowIndexes();
  }

  /**
   * Detaches the click listener on the root element. Note that we are attaching
   * this listener on ngAfterViewInit function.
   */
  ngOnDestroy(): void {
    const clickRootElement: HTMLElement = this.getClickRootElement();

    if (!clickRootElement) {
      return;
    }

    clickRootElement.removeEventListener('mouseup', this.handleRootMouseUpBound);

    if (this.rowChangeSubscription) {
      this.rowChangeSubscription.unsubscribe();
    }
  }

  /**
   * Handles caption element click on a cfc-expanding-row component. Note
   * that caption element is visible only when the row is expanded. So this
   * means we will collapse the expanded row. The scroll adjustment below
   * makes sure that the mouse stays under the summary of the expanded row
   * when the row collapses.
   */
  handleRowCaptionClick(row: ExpandingRow): void {
    const scrollAdjustment: number = -ExpandingRowHost.rowMargin;
    const scrollElement: HTMLElement = this.getScrollElement() as HTMLElement;
    if (!scrollElement) {
      return;
    }

    scrollElement.scrollTop += scrollAdjustment;
  }

  /**
   * Handles summary element click on a cfc-expanding-row component. Note
   * that summary element is visible only when the row is collapsed. So this
   * event will fired prior to expansion of a collapsed row. Scroll adjustment
   * below makes sure mouse stays on the caption element when the collapsed
   * row expands.
   */
  handleRowSummaryClick(row: ExpandingRow): void {
    const hadPreviousSelection: boolean = !!this.expandedRow;
    const previousSelectedRowIndex: number = this.getRowIndex(this.expandedRow as ExpandingRow);
    const newSelectedRowIndex: number = this.getRowIndex(row);
    const previousCollapsedHeight: number = this.getSelectedRowCollapsedHeight();
    const previousExpansionHeight = this.getSelectedRowExpandedHeight();

    if (this.expandedRow) {
      return;
    }

    let scrollAdjustment = 0;
    const scrollElement: HTMLElement = this.getScrollElement() as HTMLElement;
    if (!scrollElement) {
      return;
    }

    if (previousExpansionHeight > 0 && previousCollapsedHeight >= 0) {
      scrollAdjustment = previousExpansionHeight - previousCollapsedHeight;
    }

    const newSelectionIsInfrontOfPrevious: boolean = newSelectedRowIndex > previousSelectedRowIndex;
    const multiplier = newSelectionIsInfrontOfPrevious ? -1 : 0;
    scrollAdjustment = scrollAdjustment * multiplier + ExpandingRowHost.rowMargin;

    scrollElement.scrollTop += scrollAdjustment;
  }

  /**
   * Handles expansion of a row. When a new row expands, we need to remove
   * previous expansion and collapse. We also need to save the currently
   * expanded row so that we can collapse this row once another row expands.
   */
  handleRowExpand(row: ExpandingRow): void {
    this.removePreviousFocus();
    this.removePreviousExpansion();
    this.expandedRow = row;
  }

  /**
   * Handles focus on a row. When a new row gets focus (note that this is
   * different from expansion), we need to remove previous focus and expansion.
   * We need to save the reference to this focused row so that we can unfocus
   * this row when another row is focused.
   */
  handleRowFocus(row: ExpandingRow): void {
    // Do not blur then refocus the row if it's already selected.
    if (row === this.focusedRow) {
      return;
    }

    this.removePreviousFocus();
    this.removePreviousExpansion();
    this.focusedRow = row;
  }

  /**
   * Called when shift+tabbing from the first focusable element after the list
   * of expanding rows or tabbing from the last focusable element before.
   */
  focusOnLastFocusedRow(): void {
    if (!this.lastFocusedRow) {
      this.lastFocusedRow = this.contentRows.toArray()[0];
    }
    this.lastFocusedRow.focus();
  }

  /**
   * Function that is called by expanding row summary to focus on the last
   * focusable element before the list of expanding rows.
   */
  focusOnPreviousFocusableElement(): void {
    this.lastFocusedRow = this.focusedRow;
  }

  /**
   * Function that is called by expanding row summary to focus on the next
   * focusable element after the list of expanding rows.
   */
  focusOnNextFocusableElement(): void {
    this.lastFocusedRow = this.focusedRow;
  }

  /**
   * Handles keydown event on the host. We are just concerned with up,
   * down arrow, ESC, and ENTER presses here. Note that Up/Down presses
   * can be repeated.
   *
   * - Up: Focuses on the row above.
   * - Down: Focuses on the row below.
   * - Escape: Collapses the expanded row.
   * - Enter: Expands the focused row.
   */
  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {}

  /**
   * Recursively returns true if target HTMLElement is within a
   * cfc-expanding-row component. It will return false otherwise.
   * We need this function in handleRootMouseUp to collapse the expanded row
   * when user clicks outside of all expanded rows.
   */
  private isTargetInRow(target: HTMLElement): boolean {
    return target.classList.contains(EXPANDING_ROW_CLASS_NAME);
  }

  /**
   * Gets the click root element that is described by clickRootElementSelector
   * @Input value.
   */
  private getClickRootElement(): HTMLElement {
    return document.querySelector(this.clickRootElementSelector) as HTMLElement;
  }

  /**
   * Handles all of the mouseup events on the click root. When user clicks
   * outside of an expanded row, we need to collapse that row.
   * We trigger collapse by calling handleCaptionClick() on the expanded row.
   */
  private handleRootMouseUp(event: MouseEvent): void {
    if (!this.expandedRow) {
      return;
    }

    if (!this.isTargetInRow(event.target as {} as HTMLElement)) {
      this.expandedRow.handleCaptionClick(event);
    }
  }

  /**
   * Check if element is collapsible.  Elements marked as uncollapsible will not collapse an
   * open row when clicked.
   */
  isCollapsible(element: HTMLElement | null): boolean {
    const clickRoot = this.getClickRootElement();
    while (element && element !== clickRoot) {
      if (element.hasAttribute('cfcUncollapsible')) {
        return false;
      }
      element = element.parentElement;
    }
    return true;
  }

  /**
   * Removes focus state from a previously focused row. We blur this row and
   * set the focusedRow to undefined in this method. This usually happens when
   * another row is focused.
   */
  private removePreviousFocus(): void {
    if (this.focusedRow) {
      this.focusedRow.blur();
      this.focusedRow = undefined;
    }
  }

  /**
   * Removes the expanded state from a previously expanded row. We collapse this
   * row and set the expandedRow to undefined in this method. This usually
   * happens when another row is expanded.
   */
  private removePreviousExpansion(): void {
    if (this.expandedRow) {
      this.expandedRow.collapse();
      this.expandedRow = undefined;
    }
  }

  /**
   * Gets the collapsed height of the currently expanded row. We need this for
   * scroll adjustments. Note that collapsed height of a cfc-expanding-row
   * component is equal to height of cfc-expanding-row-summary component within
   * the row.
   */
  private getSelectedRowCollapsedHeight(): number {
    if (this.expandedRow) {
      return this.expandedRow.collapsedHeight;
    } else {
      return -1;
    }
  }

  /**
   * Gets the current height of the expanded row. We need this value for the
   * scroll adjustment computation.
   */
  private getSelectedRowExpandedHeight(): number {
    if (this.expandedRow) {
      return this.expandedRow.getHeight();
    } else {
      return -1;
    }
  }

  /**
   * Gets the HTML element described by scrollElementSelector @Input value.
   * We need this value for scroll adjustments.
   */
  private getScrollElement(): HTMLElement | undefined {
    if (!this.scrollElementSelector) {
      return undefined;
    }

    return document.querySelector(this.scrollElementSelector) as HTMLElement;
  }

  /**
   * Handles escape presses on the host element. Escape removes previous focus
   * if there is one. If there is an expanded row, escape row collapses this
   * row and focuses on it. A subsequent escape press will blur this row.
   */
  private handleEscapePress(): void {
    this.removePreviousFocus();

    if (this.expandedRow) {
      this.expandedRow.collapse();
      this.expandedRow.focus();
      this.expandedRow = undefined;
    }
  }

  /**
   * Handles enter keypress. If there is a focused row, an enter key press on
   * host element will expand this row.
   */
  private handleEnterPress(): void {
    if (document.activeElement !== this.focusedRowSummary()) {
      return;
    }

    if (this.focusedRow) {
      this.focusedRow.expand();
    }
  }

  /** Returns the HTMLElement that is the currently focused row summary. */
  private focusedRowSummary(): HTMLElement | undefined {
    return this.focusedRow
      ? this.focusedRow.summaryViewChild.mainElementRef.nativeElement
      : undefined;
  }

  /**
   * Returns the index of a given row. This enables us to figure out the row
   * above/below the focused row.
   */
  private getRowIndex(rowToLookFor: ExpandingRow): number {
    return rowToLookFor ? rowToLookFor.index : -1;
  }

  /**
   * Handles up/down arrow presses on the host element. Up arrow press will
   * focus/expand on the row above. Down arrow press will focus/expand the row
   * below. If we have a focus on the current row, this function will focus on
   * the computed (the one above or below) row. If host has an expanded row,
   * this function will expand the computed row.
   */
  private handleUpOrDownPressOnce(upOrDown: UpOrDown, event: KeyboardEvent): void {
    event.preventDefault();

    // If row is expanded but focus is inside the expanded element, arrow
    // key presses should not do anything.
    if (
      this.expandedRow &&
      document.activeElement !== this.expandedRow.expandingRowMainElement.nativeElement
    ) {
      return;
    }

    // If focus is inside a collapsed row header, arrow key presses should not
    // do anything.
    if (this.focusedRow && document.activeElement !== this.focusedRowSummary()) {
      return;
    }
    // We only want screen reader to read the message the first time we enter
    // the list of expanding rows, so we must reset the variable here
    this.lastFocusedRow = undefined;

    const rowToLookFor: ExpandingRow | undefined = this.expandedRow || this.focusedRow;
    if (!rowToLookFor) {
      return;
    }

    const isFocus: boolean = rowToLookFor === this.focusedRow;

    const rowIndex: number = this.getRowIndex(rowToLookFor);
    const contentRowsArray: ExpandingRow[] = this.contentRows.toArray();

    if (rowIndex < 0) {
      return;
    }

    const potentialIndex: number = (upOrDown === 'up' ? -1 : +1) + rowIndex;
    if (potentialIndex < 0) {
      this.onPrepend.emit();
      return;
    }

    if (potentialIndex >= contentRowsArray.length) {
      return;
    }

    const potentialRow: ExpandingRow = contentRowsArray[potentialIndex];
    if (isFocus) {
      potentialRow.focus();
    } else {
      potentialRow.expand();
    }
  }

  // Updates all of the rows with their new index.
  private recalcRowIndexes() {
    let index = 0;
    setTimeout(() => {
      this.contentRows.forEach((row: ExpandingRow) => {
        row.index = index++;
      });
    });
  }
}
