/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

/**
 * A service for copying text to the clipboard.
 *
 * Example usage:
 *
 * clipboard.copy("copy this text");
 */
@Injectable({providedIn: 'root'})
export class Clipboard {
  private _document: Document;

  constructor(@Inject(DOCUMENT) document: any) {
    this._document = document;
  }

  /**
   * Copies the provided text into the user's clipboard.
   *
   * @param text The string to copy.
   * @returns Whether the operation was successful.
   */
  copy(text: string): boolean {
    const pendingCopy = this.beginCopy(text);
    const successful = pendingCopy.copy();
    pendingCopy.destroy();

    return successful;
  }

  /**
   * Prepares a string to be copied later. This is useful for large strings
   * which take too long to successfully render and be copied in the same tick.
   *
   * The caller must call `destroy` on the returned `PendingCopy`.
   *
   * @param text The string to copy.
   * @returns the pending copy operation.
   */
  beginCopy(text: string): PendingCopy {
    return new PendingCopy(text, this._document);
  }
}

/**
 * A pending copy-to-clipboard operation.
 *
 * The implementation of copying text to the clipboard modifies the DOM and
 * forces a relayout. This relayout can take too long if the string is large,
 * causing the execCommand('copy') to happen too long after the user clicked.
 * This results in the browser refusing to copy. This object lets the
 * relayout happen in a separate tick from copying by providing a copy function
 * that can be called later.
 *
 * Destroy must be called when no longer in use, regardless of whether `copy` is
 * called.
 */
export class PendingCopy {
  private _textarea: HTMLTextAreaElement|undefined;

  constructor(text: string, private readonly _document: Document) {
    const textarea = this._textarea = this._document.createElement('textarea');

    // Hide the element for display and accessibility.
    textarea.setAttribute('style', 'opacity: 0;');
    textarea.setAttribute('aria-hidden', 'true');

    textarea.value = text;
    this._document.body.appendChild(textarea);
  }

  /** Finishes copying the text. */
  copy(): boolean {
    const textarea = this._textarea;
    let successful = false;

    try {  // Older browsers could throw if copy is not supported.
      if (textarea) {
        const currentFocus = document.activeElement;

        textarea.select();
        successful = this._document.execCommand('copy');

        if (currentFocus instanceof HTMLElement) {
          currentFocus.focus();
        }
      }
    } catch {
      // Discard error.
      // Initial setting of {@code successful} will represent failure here.
    }

    return successful;
  }

  /** Cleans up DOM changes used to perform the copy operation. */
  destroy() {
    if (this._textarea) {
      this._document.body.removeChild(this._textarea);
      this._textarea = undefined;
    }
  }
}
