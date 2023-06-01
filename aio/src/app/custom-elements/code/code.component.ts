import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Logger } from 'app/shared/logger.service';
import { PrettyPrinter } from './pretty-printer.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { unwrapHtml } from 'safevalues';
import { htmlSafeByReview } from 'safevalues/restricted/reviewed';
import { fromOuterHTML } from 'app/shared/security';

/**
 * Formatted Code Block
 *
 * Pretty renders a code block, used in the docs and API reference by the code-example and
 * code-tabs embedded components.
 * It includes a "copy" button that will send the content to the clipboard when clicked
 *
 * Example usage:
 *
 * ```
 * <aio-code
 *   [language]="ts"
 *   [linenums]="true"
 *   [path]="router/src/app/app.module.ts"
 *   [region]="animations-module">
 * </aio-code>
 * ```
 *
 *
 * Renders code provided through the `updateCode` method.
 */
@Component({
  selector: 'aio-code',
  template: `
    <pre class="prettyprint lang-{{language}}">
      <button *ngIf="!hideCopy" class="material-icons copy-button no-print"
        title="Copy code snippet"
        [attr.aria-label]="ariaLabel"
        (click)="doCopy()">
        <span aria-hidden="true">content_copy</span>
      </button>
      <code class="animated fadeIn" #codeContainer></code>
    </pre>
    `
})
export class CodeComponent implements OnChanges {
  ariaLabel = '';

  /** The code to be copied when clicking the copy button, this should not be HTML encoded */
  private codeText: string;

  /** Code that should be formatted with current inputs and displayed in the view. */
  set code(code: TrustedHTML) {
    this._code = code;

    if (!this._code.toString().trim()) {
      this.showMissingCodeMessage();
    } else {
      this.formatDisplayedCode();
    }
  }
  get code(): TrustedHTML {
    return this._code;
  }
  _code: TrustedHTML;

  /** Whether the copy button should be shown. */
  @Input() hideCopy: boolean;

  /** Language to render the code (e.g. javascript, typescript). */
  @Input() language: string | undefined;

  /**
   * Whether to display line numbers:
   *  - If false: hide
   *  - If true: show
   *  - If number: show but start at that number
   */
  @Input() linenums: boolean | number | string | undefined;

  /** Path to the source of the code. */
  @Input() path: string;

  /** Region of the source of the code being displayed. */
  @Input() region: string;

  /** Optional header to be displayed above the code. */
  @Input()
  set header(header: string | undefined) {
    this._header = header;
    this.ariaLabel = this.header ? `Copy code snippet from ${this.header}` : '';
  }
  get header(): string|undefined { return this._header; }
  private _header: string | undefined;

  @Output() codeFormatted = new EventEmitter<void>();

  /** The element in the template that will display the formatted code. */
  @ViewChild('codeContainer', { static: true }) codeContainer: ElementRef;

  constructor(
    private snackbar: MatSnackBar,
    private pretty: PrettyPrinter,
    private clipboard: Clipboard,
    private logger: Logger) {}

  ngOnChanges() {
    // If some inputs have changed and there is code displayed, update the view with the latest
    // formatted code.
    if (this.code) {
      this.formatDisplayedCode();
    }
  }

  private formatDisplayedCode() {
    const linenums = this.getLinenums();
    const leftAlignedCode = leftAlign(this.code);
    this.setCodeHtml(leftAlignedCode); // start with unformatted code
    this.codeText = this.getCodeText(); // store the unformatted code as text (for copying)

    const skipPrettify = of(undefined);
    const prettifyCode = this.pretty
        .formatCode(leftAlignedCode, this.language, linenums)
        .pipe(tap(formattedCode => this.setCodeHtml(formattedCode)));

    if (linenums !== false && this.language === 'none') {
      this.logger.warn("Using 'linenums' with 'language: none' is currently not supported.");
    }

    ((this.language === 'none' ? skipPrettify : prettifyCode) as Observable<unknown>)
        .subscribe({
          next: () => this.codeFormatted.emit(),
          error: () => { /* ignore failure to format */ },
        });
  }

  /** Sets the message showing that the code could not be found. */
  private showMissingCodeMessage() {
    const src = this.path ? this.path + (this.region ? '#' + this.region : '') : '';
    const msg = `The code sample is missing${src ? ` for\n${src}` : '.'}`;
    const el = document.createElement('p');
    el.className = 'code-missing';
    el.textContent = msg;
    this.setCodeHtml(fromOuterHTML(el));
  }

  /** Sets the innerHTML of the code container to the provided code string. */
  private setCodeHtml(formattedCode: TrustedHTML) {
    // **Security:** Code example content is provided by docs authors and as such its considered to
    // be safe for innerHTML purposes.
    this.codeContainer.nativeElement.innerHTML = unwrapHtml(formattedCode);
  }

  /** Gets the textContent of the displayed code element. */
  private getCodeText() {
    // `prettify` may remove newlines, e.g. when `linenums` are on. Retrieve the content of the
    // container as text, before prettifying it.
    // We take the textContent because we don't want it to be HTML encoded.
    return this.codeContainer.nativeElement.textContent;
  }

  /** Copies the code snippet to the user's clipboard. */
  doCopy() {
    const code = this.codeText;
    const successfullyCopied = this.clipboard.copy(code);

    if (successfullyCopied) {
      this.logger.log('Copied code to clipboard:', code);
      this.snackbar.open('Code Copied', '', { duration: 800 });
    } else {
      this.logger.error(new Error(`ERROR copying code to clipboard: "${code}"`));
      this.snackbar.open('Copy failed. Please try again!', '', { duration: 800 });
    }
  }

  /** Gets the calculated value of linenums (boolean/number). */
  getLinenums() {
    const linenums =
      typeof this.linenums === 'boolean' ? this.linenums :
      this.linenums === 'true' ? true :
      this.linenums === 'false' ? false :
      typeof this.linenums === 'string' ? parseInt(this.linenums, 10) :
      this.linenums;

    return (linenums != null) && !isNaN(linenums as number) && linenums;
  }
}

function leftAlign(text: TrustedHTML): TrustedHTML {
  let indent = Number.MAX_VALUE;

  const lines = text.toString().split('\n');
  lines.forEach(line => {
    const lineIndent = line.search(/\S/);
    if (lineIndent !== -1) {
      indent = Math.min(lineIndent, indent);
    }
  });

  return htmlSafeByReview(
      lines.map(line => line.slice(indent)).join('\n').trim(),
      'safe manipulation of existing trusted HTML');
}
