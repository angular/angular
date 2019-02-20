/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {END, ENTER, HOME, SPACE, hasModifierKey} from '@angular/cdk/keycodes';
import {ViewportRuler} from '@angular/cdk/scrolling';
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
  NgZone,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit,
} from '@angular/core';
import {CanDisableRipple, CanDisableRippleCtor, mixinDisableRipple} from '@angular/material/core';
import {merge, of as observableOf, Subject, timer, fromEvent} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatInkBar} from './ink-bar';
import {MatTabLabelWrapper} from './tab-label-wrapper';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {Platform, normalizePassiveListenerOptions} from '@angular/cdk/platform';


/** Config used to bind passive event listeners */
const passiveEventListenerOptions =
    normalizePassiveListenerOptions({passive: true}) as EventListenerOptions;

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

/**
 * Amount of milliseconds to wait before starting to scroll the header automatically.
 * Set a little conservatively in order to handle fake events dispatched on touch devices.
 */
const HEADER_SCROLL_DELAY = 650;

/**
 * Interval in milliseconds at which to scroll the header
 * while the user is holding their pointer.
 */
const HEADER_SCROLL_INTERVAL = 100;

// Boilerplate for applying mixins to MatTabHeader.
/** @docs-private */
export class MatTabHeaderBase {}
export const _MatTabHeaderMixinBase: CanDisableRippleCtor & typeof MatTabHeaderBase =
    mixinDisableRipple(MatTabHeaderBase);

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mat-tab-header',
    '[class.mat-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.mat-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
  },
})
export class MatTabHeader extends _MatTabHeaderMixinBase
    implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy, CanDisableRipple {

  @ContentChildren(MatTabLabelWrapper) _labelWrappers: QueryList<MatTabLabelWrapper>;
  @ViewChild(MatInkBar, {static: true}) _inkBar: MatInkBar;
  @ViewChild('tabListContainer', {static: true}) _tabListContainer: ElementRef;
  @ViewChild('tabList', {static: true}) _tabList: ElementRef;
  @ViewChild('nextPaginator') _nextPaginator: ElementRef<HTMLElement>;
  @ViewChild('previousPaginator') _previousPaginator: ElementRef<HTMLElement>;

  /** The distance in pixels that the tab labels should be translated to the left. */
  private _scrollDistance = 0;

  /** Whether the header should scroll to the selected index after the view has been checked. */
  private _selectedIndexChanged = false;

  /** Emits when the component is destroyed. */
  private readonly _destroyed = new Subject<void>();

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

  /** Used to manage focus between the tabs. */
  private _keyManager: FocusKeyManager<MatTabLabelWrapper>;

  /** Cached text content of the header. */
  private _currentTextContent: string;

  /** Stream that will stop the automated scrolling. */
  private _stopScrolling = new Subject<void>();

  /** The index of the active tab. */
  @Input()
  get selectedIndex(): number { return this._selectedIndex; }
  set selectedIndex(value: number) {
    value = coerceNumberProperty(value);
    this._selectedIndexChanged = this._selectedIndex != value;
    this._selectedIndex = value;

    if (this._keyManager) {
      this._keyManager.updateActiveItemIndex(value);
    }
  }
  private _selectedIndex: number = 0;

  /** Event emitted when the option is selected. */
  @Output() readonly selectFocusedIndex: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when a label is focused. */
  @Output() readonly indexFocused: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _elementRef: ElementRef,
              private _changeDetectorRef: ChangeDetectorRef,
              private _viewportRuler: ViewportRuler,
              @Optional() private _dir: Directionality,
              // @breaking-change 8.0.0 `_ngZone` and `_platforms` parameters to be made required.
              private _ngZone?: NgZone,
              private _platform?: Platform) {
    super();

    const element = _elementRef.nativeElement;
    const bindEvent = () => {
      fromEvent(element, 'mouseleave')
        .pipe(takeUntil(this._destroyed))
        .subscribe(() => {
          this._stopInterval();
        });
    };

    // @breaking-change 8.0.0 remove null check once _ngZone is made into a required parameter.
    if (_ngZone) {
      // Bind the `mouseleave` event on the outside since it doesn't change anything in the view.
      _ngZone.runOutsideAngular(bindEvent);
    } else {
      bindEvent();
    }
  }

  ngAfterContentChecked(): void {
    // If the number of tab labels have changed, check if scrolling should be enabled
    if (this._tabLabelCount != this._labelWrappers.length) {
      this.updatePagination();
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

  /** Handles keyboard events on the header. */
  _handleKeydown(event: KeyboardEvent) {
    // We don't handle any key bindings with a modifier key.
    if (hasModifierKey(event)) {
      return;
    }

    switch (event.keyCode) {
      case HOME:
        this._keyManager.setFirstItemActive();
        event.preventDefault();
        break;
      case END:
        this._keyManager.setLastItemActive();
        event.preventDefault();
        break;
      case ENTER:
      case SPACE:
        this.selectFocusedIndex.emit(this.focusIndex);
        event.preventDefault();
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  /**
   * Aligns the ink bar to the selected tab on load.
   */
  ngAfterContentInit() {
    const dirChange = this._dir ? this._dir.change : observableOf(null);
    const resize = this._viewportRuler.change(150);
    const realign = () => {
      this.updatePagination();
      this._alignInkBarToSelectedTab();
    };

    this._keyManager = new FocusKeyManager(this._labelWrappers)
      .withHorizontalOrientation(this._getLayoutDirection())
      .withWrap();

    this._keyManager.updateActiveItem(0);

    // Defer the first call in order to allow for slower browsers to lay out the elements.
    // This helps in cases where the user lands directly on a page with paginated tabs.
    typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(realign) : realign();

    // On dir change or window resize, realign the ink bar and update the orientation of
    // the key manager if the direction has changed.
    merge(dirChange, resize).pipe(takeUntil(this._destroyed)).subscribe(() => {
      realign();
      this._keyManager.withHorizontalOrientation(this._getLayoutDirection());
    });

    // If there is a change in the focus key manager we need to emit the `indexFocused`
    // event in order to provide a public event that notifies about focus changes. Also we realign
    // the tabs container by scrolling the new focused tab into the visible section.
    this._keyManager.change.pipe(takeUntil(this._destroyed)).subscribe(newFocusIndex => {
      this.indexFocused.emit(newFocusIndex);
      this._setTabFocus(newFocusIndex);
    });
  }

  ngAfterViewInit() {
    // We need to handle these events manually, because we want to bind passive event listeners.
    fromEvent(this._previousPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => {
        this._handlePaginatorPress('before');
      });

    fromEvent(this._nextPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => {
        this._handlePaginatorPress('after');
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this._stopScrolling.complete();
  }

  /**
   * Callback for when the MutationObserver detects that the content has changed.
   */
  _onContentChanges() {
    const textContent = this._elementRef.nativeElement.textContent;

    // We need to diff the text content of the header, because the MutationObserver callback
    // will fire even if the text content didn't change which is inefficient and is prone
    // to infinite loops if a poorly constructed expression is passed in (see #14249).
    if (textContent !== this._currentTextContent) {
      this._currentTextContent = textContent;

      const zoneCallback = () => {
        this.updatePagination();
        this._alignInkBarToSelectedTab();
        this._changeDetectorRef.markForCheck();
      };

      // The content observer runs outside the `NgZone` by default, which
      // means that we need to bring the callback back in ourselves.
      // @breaking-change 8.0.0 Remove null check for `_ngZone` once it's a required parameter.
      this._ngZone ? this._ngZone.run(zoneCallback) : zoneCallback();
    }
  }

  /**
   * Updates the view whether pagination should be enabled or not.
   *
   * WARNING: Calling this method can be very costly in terms of performance.  It should be called
   * as infrequently as possible from outside of the Tabs component as it causes a reflow of the
   * page.
   */
  updatePagination() {
    this._checkPaginationEnabled();
    this._checkScrollingControls();
    this._updateTabScrollPosition();
  }

  /** Tracks which element has focus; used for keyboard navigation */
  get focusIndex(): number {
    return this._keyManager ? this._keyManager.activeItemIndex! : 0;
  }

  /** When the focus index is set, we must manually send focus to the correct label */
  set focusIndex(value: number) {
    if (!this._isValidIndex(value) || this.focusIndex === value || !this._keyManager) {
      return;
    }

    this._keyManager.setActiveItem(value);
  }

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

  /** The layout direction of the containing app. */
  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Performs the CSS transformation on the tab list that will cause the list to scroll. */
  _updateTabScrollPosition() {
    const scrollDistance = this.scrollDistance;
    const platform = this._platform;
    const translateX = this._getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance;

    // Don't use `translate3d` here because we don't want to create a new layer. A new layer
    // seems to cause flickering and overflow in Internet Explorer. For example, the ink bar
    // and ripples will exceed the boundaries of the visible tab bar.
    // See: https://github.com/angular/material2/issues/10276
    // We round the `transform` here, because transforms with sub-pixel precision cause some
    // browsers to blur the content of the element.
    this._tabList.nativeElement.style.transform = `translateX(${Math.round(translateX)}px)`;

    // Setting the `transform` on IE will change the scroll offset of the parent, causing the
    // position to be thrown off in some cases. We have to reset it ourselves to ensure that
    // it doesn't get thrown off. Note that we scope it only to IE and Edge, because messing
    // with the scroll position throws off Chrome 71+ in RTL mode (see #14689).
    // @breaking-change 8.0.0 Remove null check for `platform`.
    if (platform && (platform.TRIDENT || platform.EDGE)) {
      this._tabListContainer.nativeElement.scrollLeft = 0;
    }
  }

  /** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
  get scrollDistance(): number { return this._scrollDistance; }
  set scrollDistance(value: number) {
    this._scrollTo(value);
  }

  /**
   * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
   * the end of the list, respectively). The distance to scroll is computed to be a third of the
   * length of the tab list view window.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
  _scrollHeader(direction: ScrollDirection) {
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;

    // Move the scroll distance one-third the length of the tab list's viewport.
    const scrollAmount = (direction == 'before' ? -1 : 1) * viewLength / 3;

    return this._scrollTo(this._scrollDistance + scrollAmount);
  }

  /** Handles click events on the pagination arrows. */
  _handlePaginatorClick(direction: ScrollDirection) {
    this._stopInterval();
    this._scrollHeader(direction);
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
  _alignInkBarToSelectedTab(): void {
    const selectedLabelWrapper = this._labelWrappers && this._labelWrappers.length ?
        this._labelWrappers.toArray()[this.selectedIndex].elementRef.nativeElement :
        null;

    this._inkBar.alignToElement(selectedLabelWrapper!);
  }

  /** Stops the currently-running paginator interval.  */
  _stopInterval() {
    this._stopScrolling.next();
  }

  /**
   * Handles the user pressing down on one of the paginators.
   * Starts scrolling the header after a certain amount of time.
   * @param direction In which direction the paginator should be scrolled.
   */
  _handlePaginatorPress(direction: ScrollDirection) {
    // Avoid overlapping timers.
    this._stopInterval();

    // Start a timer after the delay and keep firing based on the interval.
    timer(HEADER_SCROLL_DELAY, HEADER_SCROLL_INTERVAL)
      // Keep the timer going until something tells it to stop or the component is destroyed.
      .pipe(takeUntil(merge(this._stopScrolling, this._destroyed)))
      .subscribe(() => {
        const {maxScrollDistance, distance} = this._scrollHeader(direction);

        // Stop the timer if we've reached the start or the end.
        if (distance === 0 || distance >= maxScrollDistance) {
          this._stopInterval();
        }
      });
  }

  /**
   * Scrolls the header to a given position.
   * @param position Position to which to scroll.
   * @returns Information on the current scroll distance and the maximum.
   */
  private _scrollTo(position: number) {
    const maxScrollDistance = this._getMaxScrollDistance();
    this._scrollDistance = Math.max(0, Math.min(maxScrollDistance, position));

    // Mark that the scroll distance has changed so that after the view is checked, the CSS
    // transformation can move the header.
    this._scrollDistanceChanged = true;
    this._checkScrollingControls();

    return {maxScrollDistance, distance: this._scrollDistance};
  }
}
