/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {PendingCopy} from './pending-copy';

/**
 * A service for copying text to the clipboard.
 */
@Injectable({providedIn: 'root'})
export class Clipboard {
  private readonly _document: Document;

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
