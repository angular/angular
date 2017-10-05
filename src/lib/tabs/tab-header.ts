/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {startWith} from '@angular/cdk/rxjs';
import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {CanDisableRipple, mixinDisableRipple} from '@angular/material/core';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {Subscription} from 'rxjs/Subscription';
import {MatInkBar} from './ink-bar';
import {MatTabLabelWrapper} from './tab-label-wrapper';
import {ViewportRuler} from '@angular/cdk/scrolling';


/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';

/**
 * The distance in pixels that will be overshot when scrolling a tab label into view. This helps
 * provide a small affordance to the label next to it.
 */
const EXAGGERATED_OVERSCROLL = 60;

// Boilerplate for applying mixins to MatTabHeader.
/** @docs-private */
export class MatTabHeaderBase {}
export const _MatTabHeaderMixinBase = mixinDisableRipple(MatTabHeaderBase);

/**
 * The header of the tab group which displays a list of all the tabs in the tab group. Includes
 * an ink bar that follows the currently selected tab. When the tabs list's width exceeds the
 * width of the header container, then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tab-header',
  templateUrl: 'tab-header.html',
  styleUrls: ['tab-header.css'],
  inputs: ['disableRipple'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mat-tab-header',
    '[class.mat-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.mat-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
  },
})
export class MatTabHeader extends _MatTabHeaderMixinBase
    implements AfterContentChecked, AfterContentInit, OnDestroy, CanDisableRipple {

  @ContentChildren(MatTabLabelWrapper) _labelWrappers: QueryList<MatTabLabelWrapper>;
  @ViewChild(MatInkBar) _inkBar: MatInkBar;
  @ViewChild('tabListContainer') _tabListContainer: ElementRef;
  @ViewChild('tabList') _tabList: ElementRef;

  /** The tab index that is focused. */
  private _focusIndex: number = 0;

  /** The distance in pixels that the tab labels should be translated to the left. */
  private _scrollDistance = 0;

  /** Whether the header should scroll to the selected index after the view has been checked. */
  private _selectedIndexChanged = false;

  /** Combines listeners that will re-align the ink bar whenever they're invoked. */
  private _realignInkBar = Subscription.EMPTY;

  /** Whether the controls for pagination should be displayed */
  _showPaginationControls = false;

  /** Whether the tab list can be scrolled more towards the end of the tab label list. */
  _disableScrollAfter = true;

  /** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
  _disableScrollBefore = true;

  /**
   * The number of tab labels that are displayed on the header. When this changes, the header
   * should re-evaluate the scroll position.
   */
  private _tabLabelCount: number;

  /** Whether the scroll distance has changed and should be applied after the view is checked. */
  private _scrollDistanceChanged: boolean;

  private _selectedIndex: number = 0;

  /** The index of the active tab. */
  @Input()
  get selectedIndex(): number { return this._selectedIndex; }
  set selectedIndex(value: number) {
    this._selectedIndexChanged = this._selectedIndex != value;
    this._selectedIndex = value;
    this._focusIndex = value;
  }

  /** Event emitted when the option is selected. */
  @Output() selectFocusedIndex = new EventEmitter();

  /** Event emitted when a label is focused. */
  @Output() indexFocused = new EventEmitter();

  constructor(private _elementRef: ElementRef,
              private _renderer: Renderer2,
              private _changeDetectorRef: ChangeDetectorRef,
              private _viewportRuler: ViewportRuler,
              @Optional() private _dir: Directionality) {
    super();
  }

  ngAfterContentChecked(): void {
    // If the number of tab labels have changed, check if scrolling should be enabled
    if (this._tabLabelCount != this._labelWrappers.length) {
      this._updatePagination();
      this._tabLabelCount = this._labelWrappers.length;
      this._changeDetectorRef.markForCheck();
    }

    // If the selected index has changed, scroll to the label and check if the scrolling controls
    // should be disabled.
    if (this._selectedIndexChanged) {
      this._scrollToLabel(this._selectedIndex);
      this._checkScrollingControls();
      this._alignInkBarToSelectedTab();
      this._selectedIndexChanged = false;
      this._changeDetectorRef.markForCheck();
    }

    // If the scroll distance has been changed (tab selected, focused, scroll controls activated),
    // then translate the header to reflect this.
    if (this._scrollDistanceChanged) {
      this._updateTabScrollPosition();
      this._scrollDistanceChanged = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        this._focusNextTab();
        break;
      case LEFT_ARROW:
        this._focusPreviousTab();
        break;
      case ENTER:
      case SPACE:
        this.selectFocusedIndex.emit(this.focusIndex);
        event.preventDefault();
        break;
    }
  }

  /**
   * Aligns the ink bar to the selected tab on load.
   */
  ngAfterContentInit() {
    const dirChange = this._dir ? this._dir.change : observableOf(null);
    const resize = this._viewportRuler.change(150);

    this._realignInkBar = startWith.call(merge(dirChange, resize), null).subscribe(() => {
      this._updatePagination();
      this._alignInkBarToSelectedTab();
    });
  }

  ngOnDestroy() {
    this._realignInkBar.unsubscribe();
  }

  /**
   * Callback for when the MutationObserver detects that the content has changed.
   */
  _onContentChanges() {
    this._updatePagination();
    this._alignInkBarToSelectedTab();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Updating the view whether pagination should be enabled or not
   */
  _updatePagination() {
    this._checkPaginationEnabled();
    this._checkScrollingControls();
    this._updateTabScrollPosition();
  }

  /** When the focus index is set, we must manually send focus to the correct label */
  set focusIndex(value: number) {
    if (!this._isValidIndex(value) || this._focusIndex == value) { return; }

    this._focusIndex = value;
    this.indexFocused.emit(value);
    this._setTabFocus(value);
  }

  /** Tracks which element has focus; used for keyboard navigation */
  get focusIndex(): number { return this._focusIndex; }

  /**
   * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
   * providing a valid index and return true.
   */
  _isValidIndex(index: number): boolean {
    if (!this._labelWrappers) { return true; }

    const tab = this._labelWrappers ? this._labelWrappers.toArray()[index] : null;
    return !!tab && !tab.disabled;
  }

  /**
   * Sets focus on the HTML element for the label wrapper and scrolls it into the view if
   * scrolling is enabled.
   */
  _setTabFocus(tabIndex: number) {
    if (this._showPaginationControls) {
      this._scrollToLabel(tabIndex);
    }

    if (this._labelWrappers && this._labelWrappers.length) {
      this._labelWrappers.toArray()[tabIndex].focus();

      // Do not let the browser manage scrolling to focus the element, this will be handled
      // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
      // should be the full width minus the offset width.
      const containerEl = this._tabListContainer.nativeElement;
      const dir = this._getLayoutDirection();

      if (dir == 'ltr') {
        containerEl.scrollLeft = 0;
      } else {
        containerEl.scrollLeft = containerEl.scrollWidth - containerEl.offsetWidth;
      }
    }
  }

  /**
   * Moves the focus towards the beginning or the end of the list depending on the offset provided.
   * Valid offsets are 1 and -1.
   */
  _moveFocus(offset: number) {
    if (this._labelWrappers) {
      const tabs: MatTabLabelWrapper[] = this._labelWrappers.toArray();

      for (let i = this.focusIndex + offset; i < tabs.length && i >= 0; i += offset) {
        if (this._isValidIndex(i)) {
          this.focusIndex = i;
          return;
        }
      }
    }
  }

  /** Increment the focus index by 1 until a valid tab is found. */
  _focusNextTab(): void {
    this._moveFocus(this._getLayoutDirection() == 'ltr' ? 1 : -1);
  }

  /** Decrement the focus index by 1 until a valid tab is found. */
  _focusPreviousTab(): void {
    this._moveFocus(this._getLayoutDirection() == 'ltr' ? -1 : 1);
  }

  /** The layout direction of the containing app. */
  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Performs the CSS transformation on the tab list that will cause the list to scroll. */
  _updateTabScrollPosition() {
    const scrollDistance = this.scrollDistance;
    const translateX = this._getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance;

    this._renderer.setStyle(this._tabList.nativeElement, 'transform',
        `translate3d(${translateX}px, 0, 0)`);
  }

  /** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
  set scrollDistance(v: number) {
    this._scrollDistance = Math.max(0, Math.min(this._getMaxScrollDistance(), v));

    // Mark that the scroll distance has changed so that after the view is checked, the CSS
    // transformation can move the header.
    this._scrollDistanceChanged = true;
    this._checkScrollingControls();
  }
  get scrollDistance(): number { return this._scrollDistance; }

  /**
   * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
   * the end of the list, respectively). The distance to scroll is computed to be a third of the
   * length of the tab list view window.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
  _scrollHeader(scrollDir: ScrollDirection) {
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;

    // Move the scroll distance one-third the length of the tab list's viewport.
    this.scrollDistance += (scrollDir == 'before' ? -1 : 1) * viewLength / 3;
  }

  /**
   * Moves the tab list such that the desired tab label (marked by index) is moved into view.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
  _scrollToLabel(labelIndex: number) {
    const selectedLabel = this._labelWrappers ? this._labelWrappers.toArray()[labelIndex] : null;

    if (!selectedLabel) { return; }

    // The view length is the visible width of the tab labels.
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;

    let labelBeforePos: number, labelAfterPos: number;
    if (this._getLayoutDirection() == 'ltr') {
      labelBeforePos = selectedLabel.getOffsetLeft();
      labelAfterPos = labelBeforePos + selectedLabel.getOffsetWidth();
    } else {
      labelAfterPos = this._tabList.nativeElement.offsetWidth - selectedLabel.getOffsetLeft();
      labelBeforePos = labelAfterPos - selectedLabel.getOffsetWidth();
    }

    const beforeVisiblePos = this.scrollDistance;
    const afterVisiblePos = this.scrollDistance + viewLength;

    if (labelBeforePos < beforeVisiblePos) {
      // Scroll header to move label to the before direction
      this.scrollDistance -= beforeVisiblePos - labelBeforePos + EXAGGERATED_OVERSCROLL;
    } else if (labelAfterPos > afterVisiblePos) {
      // Scroll header to move label to the after direction
      this.scrollDistance += labelAfterPos - afterVisiblePos + EXAGGERATED_OVERSCROLL;
    }
  }

  /**
   * Evaluate whether the pagination controls should be displayed. If the scroll width of the
   * tab list is wider than the size of the header container, then the pagination controls should
   * be shown.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
  _checkPaginationEnabled() {
    const isEnabled =
        this._tabList.nativeElement.scrollWidth > this._elementRef.nativeElement.offsetWidth;

    if (!isEnabled) {
      this.scrollDistance = 0;
    }

    if (isEnabled !== this._showPaginationControls) {
      this._changeDetectorRef.markForCheck();
    }

    this._showPaginationControls = isEnabled;
  }

  /**
   * Evaluate whether the before and after controls should be enabled or disabled.
   * If the header is at the beginning of the list (scroll distance is equal to 0) then disable the
   * before button. If the header is at the end of the list (scroll distance is equal to the
   * maximum distance we can scroll), then disable the after button.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
  _checkScrollingControls() {
    // Check if the pagination arrows should be activated.
    this._disableScrollBefore = this.scrollDistance == 0;
    this._disableScrollAfter = this.scrollDistance == this._getMaxScrollDistance();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Determines what is the maximum length in pixels that can be set for the scroll distance. This
   * is equal to the difference in width between the tab list container and tab header container.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
  _getMaxScrollDistance(): number {
    const lengthOfTabList = this._tabList.nativeElement.scrollWidth;
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;
    return (lengthOfTabList - viewLength) || 0;
  }

  /** Tells the ink-bar to align itself to the current label wrapper */
  private _alignInkBarToSelectedTab(): void {
    const selectedLabelWrapper = this._labelWrappers && this._labelWrappers.length ?
        this._labelWrappers.toArray()[this.selectedIndex].elementRef.nativeElement :
        null;

    this._inkBar.alignToElement(selectedLabelWrapper);
  }
}
