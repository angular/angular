/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {IconComponent} from '../icon/icon.component';
export const REMOVED_LINE_CLASS_NAME = '.line.remove';
export const CONFIRMATION_DISPLAY_TIME_MS = 2000;
let CopySourceCodeButton = (() => {
  let _classDecorators = [
    Component({
      selector: 'button[docs-copy-source-code]',
      imports: [IconComponent],
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CopySourceCodeButton = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      CopySourceCodeButton = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    changeDetector = inject(ChangeDetectorRef);
    clipboard = inject(Clipboard);
    elementRef = inject(ElementRef);
    showCopySuccess = signal(false);
    showCopyFailure = signal(false);
    copySourceCode() {
      try {
        const codeElement = this.elementRef.nativeElement.parentElement.querySelector('code');
        const sourceCode = this.getSourceCode(codeElement);
        this.clipboard.copy(sourceCode);
        this.showResult(this.showCopySuccess);
      } catch {
        this.showResult(this.showCopyFailure);
      }
    }
    getSourceCode(codeElement) {
      this.showCopySuccess.set(false);
      this.showCopyFailure.set(false);
      const removedLines = codeElement.querySelectorAll(REMOVED_LINE_CLASS_NAME);
      if (removedLines.length) {
        // Get only those lines which are not marked as removed
        const formattedText = Array.from(codeElement.querySelectorAll('.line:not(.remove)'))
          .map((line) => line.innerText)
          .join('\n');
        return formattedText.trim();
      } else {
        const text = codeElement.innerText || '';
        return text.replace(/\n\n\n/g, ``).trim();
      }
    }
    showResult(messageState) {
      messageState.set(true);
      setTimeout(() => {
        messageState.set(false);
        // It's required for code snippets embedded in the ExampleViewer.
        this.changeDetector.markForCheck();
      }, CONFIRMATION_DISPLAY_TIME_MS);
    }
  };
  return (CopySourceCodeButton = _classThis);
})();
export {CopySourceCodeButton};
//# sourceMappingURL=copy-source-code-button.component.js.map
