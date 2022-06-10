/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
} from '@angular/core';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleConfig,
  RippleGlobalOptions,
  RippleRenderer,
  RippleTarget,
} from '@angular/material-experimental/mdc-core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {Subscription, merge} from 'rxjs';
import {
  MatListItemLine,
  MatListItemTitle,
  MatListItemIcon,
  MatListItemAvatar,
} from './list-item-sections';

@Directive({
  host: {
    '[class.mat-mdc-list-non-interactive]': '_isNonInteractive',
    '[attr.aria-disabled]': 'disabled',
  },
})
/** @docs-private */
export abstract class MatListBase {
  _isNonInteractive: boolean = true;

  /** Whether ripples for all list items is disabled. */
  @Input()
  get disableRipple(): boolean {
    return this._disableRipple;
  }
  set disableRipple(value: BooleanInput) {
    this._disableRipple = coerceBooleanProperty(value);
  }
  private _disableRipple: boolean = false;

  /** Whether all list items are disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;
}

@Directive({
  host: {
    '[class.mdc-list-item--disabled]': 'disabled',
    '[attr.aria-disabled]': 'disabled',
  },
})
/** @docs-private */
export abstract class MatListItemBase implements AfterViewInit, OnDestroy, RippleTarget {
  /** Query list matching list-item line elements. */
  abstract _lines: QueryList<MatListItemLine> | undefined;

  /** Query list matching list-item title elements. */
  abstract _titles: QueryList<MatListItemTitle> | undefined;

  /**
   * Element reference to the unscoped content in a list item.
   *
   * Unscoped content is user-projected text content in a list item that is
   * not part of an explicit line or title.
   */
  abstract _unscopedContent: ElementRef<HTMLSpanElement> | undefined;

  /** Host element for the list item. */
  _hostElement: HTMLElement;

  /** Whether animations are disabled. */
  _noopAnimations: boolean;

  @ContentChildren(MatListItemAvatar, {descendants: false}) _avatars: QueryList<never>;
  @ContentChildren(MatListItemIcon, {descendants: false}) _icons: QueryList<never>;

  /**
   * The number of lines this list item should reserve space for. If not specified,
   * lines are inferred based on the projected content.
   *
   * Explicitly specifying the number of lines is useful if you want to acquire additional
   * space and enable the wrapping of text. The unscoped text content of a list item will
   * always be able to take up the remaining space of the item, unless it represents the title.
   *
   * A maximum of three lines is supported as per the Material Design specification.
   */
  @Input()
  set lines(lines: number | string | null) {
    this._explicitLines = coerceNumberProperty(lines, null);
    this._updateItemLines(false);
  }
  _explicitLines: number | null = null;

  @Input()
  get disableRipple(): boolean {
    return (
      this.disabled || this._disableRipple || this._listBase.disableRipple || this._noopAnimations
    );
  }
  set disableRipple(value: boolean) {
    this._disableRipple = coerceBooleanProperty(value);
  }
  private _disableRipple: boolean = false;

  /** Whether the list-item is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || (this._listBase && this._listBase.disabled);
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  private _subscriptions = new Subscription();
  private _rippleRenderer: RippleRenderer | null = null;

  /** Whether the list item has unscoped text content. */
  _hasUnscopedTextContent: boolean = false;

  /**
   * Implemented as part of `RippleTarget`.
   * @docs-private
   */
  rippleConfig: RippleConfig & RippleGlobalOptions;

  /**
   * Implemented as part of `RippleTarget`.
   * @docs-private
   */
  get rippleDisabled(): boolean {
    return this.disableRipple || !!this.rippleConfig.disabled;
  }

  constructor(
    public _elementRef: ElementRef<HTMLElement>,
    protected _ngZone: NgZone,
    private _listBase: MatListBase,
    private _platform: Platform,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    globalRippleOptions?: RippleGlobalOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    this.rippleConfig = globalRippleOptions || {};
    this._hostElement = this._elementRef.nativeElement;
    this._noopAnimations = animationMode === 'NoopAnimations';

    if (!this._listBase._isNonInteractive) {
      this._initInteractiveListItem();
    }

    // If no type attribute is specified for a host `<button>` element, set it to `button`. If a
    // type attribute is already specified, we do nothing. We do this for backwards compatibility.
    // TODO: Determine if we intend to continue doing this for the MDC-based list.
    if (
      this._hostElement.nodeName.toLowerCase() === 'button' &&
      !this._hostElement.hasAttribute('type')
    ) {
      this._hostElement.setAttribute('type', 'button');
    }
  }

  ngAfterViewInit() {
    this._monitorProjectedLinesAndTitle();
    this._updateItemLines(true);
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    if (this._rippleRenderer !== null) {
      this._rippleRenderer._removeTriggerEvents();
    }
  }

  /** Whether the list item has icons or avatars. */
  _hasIconOrAvatar() {
    return !!(this._avatars.length || this._icons.length);
  }

  private _initInteractiveListItem() {
    this._hostElement.classList.add('mat-mdc-list-item-interactive');
    this._rippleRenderer = new RippleRenderer(
      this,
      this._ngZone,
      this._hostElement,
      this._platform,
    );
    this._rippleRenderer.setupTriggerEvents(this._hostElement);
  }

  /**
   * Subscribes to changes in the projected title and lines. Triggers a
   * item lines update whenever a change occurs.
   */
  private _monitorProjectedLinesAndTitle() {
    this._ngZone.runOutsideAngular(() => {
      this._subscriptions.add(
        merge(this._lines!.changes, this._titles!.changes).subscribe(() =>
          this._updateItemLines(false),
        ),
      );
    });
  }

  /**
   * Updates the lines of the list item. Based on the projected user content and optional
   * explicit lines setting, the visual appearance of the list item is determined.
   *
   * This method should be invoked whenever the projected user content changes, or
   * when the explicit lines have been updated.
   *
   * @param recheckUnscopedContent Whether the projected unscoped content should be re-checked.
   *   The unscoped content is not re-checked for every update as it is a rather expensive check
   *   for content that is expected to not change very often.
   */
  _updateItemLines(recheckUnscopedContent: boolean) {
    // If the updated is triggered too early before the view and content is initialized,
    // we just skip the update. After view initialization the update is triggered again.
    if (!this._lines || !this._titles || !this._unscopedContent) {
      return;
    }

    // Re-check the DOM for unscoped text content if requested. This needs to
    // happen before any computation or sanity checks run as these rely on the
    // result of whether there is unscoped text content or not.
    if (recheckUnscopedContent) {
      this._checkDomForUnscopedTextContent();
    }

    // Sanity check the list item lines and title in the content. This is a dev-mode only
    // check that can be dead-code eliminated by Terser in production.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      sanityCheckListItemContent(this);
    }

    const numberOfLines = this._explicitLines ?? this._inferLinesFromContent();
    const unscopedContentEl = this._unscopedContent.nativeElement;

    // Update the list item element to reflect the number of lines.
    this._hostElement.classList.toggle('mat-mdc-list-item-single-line', numberOfLines <= 1);
    this._hostElement.classList.toggle('mdc-list-item--with-one-line', numberOfLines <= 1);
    this._hostElement.classList.toggle('mdc-list-item--with-two-lines', numberOfLines === 2);
    this._hostElement.classList.toggle('mdc-list-item--with-three-lines', numberOfLines === 3);

    // If there is no title and the unscoped content is the is the only line, the
    // unscoped text content will be treated as the title of the list-item.
    if (this._hasUnscopedTextContent) {
      const treatAsTitle = this._titles.length === 0 && numberOfLines === 1;
      unscopedContentEl.classList.toggle('mdc-list-item__primary-text', treatAsTitle);
      unscopedContentEl.classList.toggle('mdc-list-item__secondary-text', !treatAsTitle);
    } else {
      unscopedContentEl.classList.remove('mdc-list-item__primary-text');
      unscopedContentEl.classList.remove('mdc-list-item__secondary-text');
    }
  }

  /**
   * Infers the number of lines based on the projected user content. This is useful
   * if no explicit number of lines has been specified on the list item.
   *
   * The number of lines is inferred based on whether there is a title, the number of
   * additional lines (secondary/tertiary). An additional line is acquired if there is
   * unscoped text content.
   */
  private _inferLinesFromContent() {
    let numOfLines = this._titles!.length + this._lines!.length;
    if (this._hasUnscopedTextContent) {
      numOfLines += 1;
    }
    return numOfLines;
  }

  /** Checks whether the list item has unscoped text content. */
  private _checkDomForUnscopedTextContent() {
    this._hasUnscopedTextContent = Array.from<ChildNode>(
      this._unscopedContent!.nativeElement.childNodes,
    )
      .filter(node => node.nodeType !== node.COMMENT_NODE)
      .some(node => !!(node.textContent && node.textContent.trim()));
  }
}

/**
 * Sanity checks the configuration of the list item with respect to the amount
 * of lines, whether there is a title, or if there is unscoped text content.
 *
 * The checks are extracted into a top-level function that can be dead-code
 * eliminated by Terser or other optimizers in production mode.
 */
function sanityCheckListItemContent(item: MatListItemBase) {
  const numTitles = item._titles!.length;
  const numLines = item._titles!.length;

  if (numTitles > 1) {
    throw Error('A list item cannot have multiple titles.');
  }
  if (numTitles === 0 && numLines > 0) {
    throw Error('A list item line can only be used if there is a list item title.');
  }
  if (
    numTitles === 0 &&
    item._hasUnscopedTextContent &&
    item._explicitLines !== null &&
    item._explicitLines > 1
  ) {
    throw Error('A list item cannot have wrapping content without a title.');
  }
  if (numLines > 2 || (numLines === 2 && item._hasUnscopedTextContent)) {
    throw Error('A list item can have at maximum three lines.');
  }
}
