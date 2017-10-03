/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input, AfterViewInit, DoCheck} from '@angular/core';
import {Platform} from '@angular/cdk/platform';


/**
 * Directive to automatically resize a textarea to fit its content.
 */
@Directive({
  selector: `textarea[mat-autosize], textarea[matTextareaAutosize]`,
  exportAs: 'matTextareaAutosize',
  host: {
    // Textarea elements that have the directive applied should have a single row by default.
    // Browsers normally show two rows by default and therefore this limits the minRows binding.
    'rows': '1',
  },
})
export class MatTextareaAutosize implements AfterViewInit, DoCheck {
  /** Keep track of the previous textarea value to avoid resizing when the value hasn't changed. */
  private _previousValue: string;

  private _minRows: number;
  private _maxRows: number;

  @Input('matAutosizeMinRows')
  get minRows() { return this._minRows; }

  set minRows(value: number) {
    this._minRows = value;
    this._setMinHeight();
  }

  @Input('matAutosizeMaxRows')
  get maxRows() { return this._maxRows; }
  set maxRows(value: number) {
    this._maxRows = value;
    this._setMaxHeight();
  }

  /** Cached height of a textarea with a single row. */
  private _cachedLineHeight: number;

  constructor(private _elementRef: ElementRef, private _platform: Platform) {}

  /** Sets the minimum height of the textarea as determined by minRows. */
  _setMinHeight(): void {
    const minHeight = this.minRows && this._cachedLineHeight ?
        `${this.minRows * this._cachedLineHeight}px` : null;

    if (minHeight)  {
      this._setTextareaStyle('minHeight', minHeight);
    }
  }

  /** Sets the maximum height of the textarea as determined by maxRows. */
  _setMaxHeight(): void {
    const maxHeight = this.maxRows && this._cachedLineHeight ?
        `${this.maxRows * this._cachedLineHeight}px` : null;

    if (maxHeight) {
      this._setTextareaStyle('maxHeight', maxHeight);
    }
  }

  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      this.resizeToFitContent();
    }
  }

  /** Sets a style property on the textarea element. */
  private _setTextareaStyle(property: string, value: string): void {
    const textarea = this._elementRef.nativeElement as HTMLTextAreaElement;
    textarea.style[property] = value;
  }

  /**
   * Cache the height of a single-row textarea if it has not already been cached.
   *
   * We need to know how large a single "row" of a textarea is in order to apply minRows and
   * maxRows. For the initial version, we will assume that the height of a single line in the
   * textarea does not ever change.
   */
  private _cacheTextareaLineHeight(): void {
    if (this._cachedLineHeight) {
      return;
    }

    let textarea = this._elementRef.nativeElement as HTMLTextAreaElement;

    // Use a clone element because we have to override some styles.
    let textareaClone = textarea.cloneNode(false) as HTMLTextAreaElement;
    textareaClone.rows = 1;

    // Use `position: absolute` so that this doesn't cause a browser layout and use
    // `visibility: hidden` so that nothing is rendered. Clear any other styles that
    // would affect the height.
    textareaClone.style.position = 'absolute';
    textareaClone.style.visibility = 'hidden';
    textareaClone.style.border = 'none';
    textareaClone.style.padding = '0';
    textareaClone.style.height = '';
    textareaClone.style.minHeight = '';
    textareaClone.style.maxHeight = '';

    // In Firefox it happens that textarea elements are always bigger than the specified amount
    // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
    // As a workaround that removes the extra space for the scrollbar, we can just set overflow
    // to hidden. This ensures that there is no invalid calculation of the line height.
    // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
    textareaClone.style.overflow = 'hidden';

    textarea.parentNode!.appendChild(textareaClone);
    this._cachedLineHeight = textareaClone.clientHeight;
    textarea.parentNode!.removeChild(textareaClone);

    // Min and max heights have to be re-calculated if the cached line height changes
    this._setMinHeight();
    this._setMaxHeight();
  }

  ngDoCheck() {
    if (this._platform.isBrowser) {
      this.resizeToFitContent();
    }
  }

  /** Resize the textarea to fit its content. */
  resizeToFitContent() {
    this._cacheTextareaLineHeight();

    // If we haven't determined the line-height yet, we know we're still hidden and there's no point
    // in checking the height of the textarea.
    if (!this._cachedLineHeight) {
      return;
    }

    const textarea = this._elementRef.nativeElement as HTMLTextAreaElement;
    const value = textarea.value;

    // Only resize of the value changed since these calculations can be expensive.
    if (value === this._previousValue) {
      return;
    }

    // Reset the textarea height to auto in order to shrink back to its default size.
    // Also temporarily force overflow:hidden, so scroll bars do not interfere with calculations.
    textarea.style.height = 'auto';
    textarea.style.overflow = 'hidden';

    // Use the scrollHeight to know how large the textarea *would* be if fit its entire value.
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.overflow = '';

    this._previousValue = value;
  }
}
