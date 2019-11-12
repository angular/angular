/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  EventEmitter,
  Input,
  Output,
  NgZone,
  InjectionToken,
  Inject,
  Optional,
} from '@angular/core';
import {Clipboard} from './clipboard';

/** Object that can be used to configure the default options for `CdkCopyToClipboard`. */
export interface CdkCopyToClipboardConfig {
  /** Default number of attempts to make when copying text to the clipboard. */
  attempts?: number;
}

/** Injection token that can be used to provide the default options to `CdkCopyToClipboard`. */
export const CKD_COPY_TO_CLIPBOARD_CONFIG =
    new InjectionToken<CdkCopyToClipboardConfig>('CKD_COPY_TO_CLIPBOARD_CONFIG');

/**
 * Provides behavior for a button that when clicked copies content into user's
 * clipboard.
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
   * How many times to attempt to copy the text. This may be necessary for longer text, because
   * the browser needs time to fill an intermediate textarea element and copy the content.
   */
  @Input('cdkCopyToClipboardAttempts') attempts: number = 1;

  /**
   * Emits when some text is copied to the clipboard. The
   * emitted value indicates whether copying was successful.
   */
  @Output('cdkCopyToClipboardCopied') copied = new EventEmitter<boolean>();

  /**
   * Emits when some text is copied to the clipboard. The
   * emitted value indicates whether copying was successful.
   * @deprecated Use `cdkCopyToClipboardCopied` instead.
   * @breaking-change 10.0.0
   */
  @Output('copied') _deprecatedCopied = this.copied;

  constructor(
    private _clipboard: Clipboard,
    /**
     * @deprecated _ngZone parameter to become required.
     * @breaking-change 10.0.0
     */
    private _ngZone?: NgZone,
    @Optional() @Inject(CKD_COPY_TO_CLIPBOARD_CONFIG) config?: CdkCopyToClipboardConfig) {

    if (config && config.attempts != null) {
      this.attempts = config.attempts;
    }
  }

  /** Copies the current text to the clipboard. */
  copy(attempts: number = this.attempts): void {
    if (attempts > 1) {
      let remainingAttempts = attempts;
      const pending = this._clipboard.beginCopy(this.text);
      const attempt = () => {
        const successful = pending.copy();
        if (!successful && --remainingAttempts) {
          // @breaking-change 10.0.0 Remove null check for `_ngZone`.
          if (this._ngZone) {
            this._ngZone.runOutsideAngular(() => setTimeout(attempt));
          } else {
            setTimeout(attempt);
          }
        } else {
          pending.destroy();
          this.copied.emit(successful);
        }
      };
      attempt();
    } else {
      this.copied.emit(this._clipboard.copy(this.text));
    }
  }
}
