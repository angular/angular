/*!
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
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Clipboard} from '@angular/cdk/clipboard';
import {IconComponent} from '../icon/icon.component';

export const REMOVED_LINE_CLASS_NAME = '.line.remove';
export const CONFIRMATION_DISPLAY_TIME_MS = 2000;

@Component({
  selector: 'button[docs-copy-source-code]',
  imports: [CommonModule, IconComponent],
  templateUrl: './copy-source-code-button.component.html',
  host: {
    'type': 'button',
    'aria-label': 'Copy example source to clipboard',
    'title': 'Copy example source',
    '(click)': 'copySourceCode()',
    '[class.docs-copy-source-code-button-success]': 'showCopySuccess()',
    '[class.docs-copy-source-code-button-failed]': 'showCopyFailure()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopySourceCodeButton {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly clipboard = inject(Clipboard);
  private readonly elementRef = inject(ElementRef);

  protected readonly showCopySuccess = signal(false);
  protected readonly showCopyFailure = signal(false);

  copySourceCode(): void {
    try {
      const codeElement = this.elementRef.nativeElement.parentElement.querySelector(
        'code',
      ) as HTMLElement;
      const sourceCode = this.getSourceCode(codeElement);
      this.clipboard.copy(sourceCode);
      this.showResult(this.showCopySuccess);
    } catch {
      this.showResult(this.showCopyFailure);
    }
  }

  private getSourceCode(codeElement: HTMLElement): string {
    this.showCopySuccess.set(false);
    this.showCopyFailure.set(false);

    const removedLines: NodeList = codeElement.querySelectorAll(REMOVED_LINE_CLASS_NAME);

    if (removedLines.length) {
      // Get only those lines which are not marked as removed
      const formattedText = Array.from(codeElement.querySelectorAll('.line:not(.remove)'))
        .map((line) => (line as HTMLDivElement).innerText)
        .join('\n');

      return formattedText.trim();
    } else {
      const text: string = codeElement.innerText || '';
      return text.replace(/\n\n\n/g, ``).trim();
    }
  }

  private showResult(messageState: WritableSignal<boolean>) {
    messageState.set(true);

    setTimeout(() => {
      messageState.set(false);
      // It's required for code snippets embedded in the ExampleViewer.
      this.changeDetector.markForCheck();
    }, CONFIRMATION_DISPLAY_TIME_MS);
  }
}
