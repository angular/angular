/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Input, Output} from '@angular/core';

import {Clipboard} from './clipboard';

/**
 * Provides behavior for a button that when clicked copies content into user's
 * clipboard.
 *
 * Example usage:
 *
 * `<button copyToClipboard="Content to be copied">Copy me!</button>`
 */
@Directive({
  selector: '[cdkCopyToClipboard]',
  host: {
    '(click)': 'copy()',
  }
})
export class CdkCopyToClipboard {
  /** Content to be copied. */
  @Input('cdkCopyToClipboard') text: string = '';

  /**
   * Emits when some text is copied to the clipboard. The
   * emitted value indicates whether copying was successful.
   */
  @Output() copied = new EventEmitter<boolean>();

  constructor(private readonly _clipboard: Clipboard) {}

  /** Copies the current text to the clipboard. */
  copy() {
    this.copied.emit(this._clipboard.copy(this.text));
  }
}
