import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Logger } from 'app/shared/logger.service';
import { PrettyPrinter } from './pretty-printer.service';
import { CopierService } from 'app/shared/copier.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';

/**
 * If linenums is not set, this is the default maximum number of lines that
 * an example can display without line numbers.
 */
const DEFAULT_LINE_NUMS_COUNT = 10;

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
  set code(code: string) {
    this._code = code;

    if (!this._code || !this._code.trim()) {
      this.showMissingCodeMessage();
    } else {
      this.formatDisplayedCode();
    }
  }
  get code(): string { return this._code; }
  _code: string;

  /** Whether the copy button should be shown. */
  @Input() hideCopy: boolean;

  /** Language to render the code (e.g. javascript, dart, typescript). */
  @Input() language: string;

  /**
   * Whether to display line numbers:
   *  - If false: hide
   *  - If true: show
   *  - If number: show but start at that number
   */
  @Input() linenums: boolean | number | string;

  /** Path to the source of the code. */
  @Input() path: string;

  /** Region of the source of the code being displayed. */
  @Input() region: string;

  /** Optional title to be displayed above the code. */
  @Input()
  set title(title: string) {
    this._title = title;
    this.ariaLabel = this.title ? `Copy code snippet from ${this.title}` : '';
  }
  get title(): string { return this._title; }
  private _title: string;

  @Output() codeFormatted = new EventEmitter<void>();

  /** The element in the template that will display the formatted code. */
  @ViewChild('codeContainer') codeContainer: ElementRef;

  constructor(
    private snackbar: MatSnackBar,
    private pretty: PrettyPrinter,
    private copier: CopierService,
    private logger: Logger) {}

  ngOnChanges() {
    // If some inputs have changed and there is code displayed, update the view with the latest
    // formatted code.
    if (this.code) {
      this.formatDisplayedCode();
    }
  }

  private formatDisplayedCode() {
    const leftAlignedCode = leftAlign(this.code);
    this.setCodeHtml(leftAlignedCode); // start with unformatted code
    this.codeText = this.getCodeText(); // store the unformatted code as text (for copying)

    this.pretty
        .formatCode(leftAlignedCode, this.language, this.getLinenums(leftAlignedCode))
        .pipe(tap(() => this.codeFormatted.emit()))
        .subscribe(c => this.setCodeHtml(c), err => { /* ignore failure to format */ }
    );
  }

  /** Sets the message showing that the code could not be found. */
  private showMissingCodeMessage() {
    const src = this.path ? this.path + (this.region ? '#' + this.region : '') : '';
    const srcMsg = src ? ` for\n${src}` : '.';
    this.setCodeHtml(`<p class="code-missing">The code sample is missing${srcMsg}</p>`);
  }

  /** Sets the innerHTML of the code container to the provided code string. */
  private setCodeHtml(formattedCode: string) {
    // **Security:** Code example content is provided by docs authors and as such its considered to
    // be safe for innerHTML purposes.
    this.codeContainer.nativeElement.innerHTML = formattedCode;
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
    const successfullyCopied = this.copier.copyText(code);

    if (successfullyCopied) {
      this.logger.log('Copied code to clipboard:', code);
      this.snackbar.open('Code Copied', '', { duration: 800 });
    } else {
      this.logger.error(new Error(`ERROR copying code to clipboard: "${code}"`));
      this.snackbar.open('Copy failed. Please try again!', '', { duration: 800 });
    }
  }

  /** Gets the calculated value of linenums (boolean/number). */
  getLinenums(code: string) {
    const linenums =
      typeof this.linenums === 'boolean' ? this.linenums :
      this.linenums === 'true' ? true :
      this.linenums === 'false' ? false :
      typeof this.linenums === 'string' ? parseInt(this.linenums, 10) :
      this.linenums;

    // if no linenums, enable line numbers if more than one line
    return linenums == null || isNaN(linenums as number) ?
        (code.match(/\n/g) || []).length > DEFAULT_LINE_NUMS_COUNT : linenums;
  }
}

function leftAlign(text: string): string {
  let indent = Number.MAX_VALUE;

  const lines = text.split('\n');
  lines.forEach(line => {
    const lineIndent = line.search(/\S/);
    if (lineIndent !== -1) {
      indent = Math.min(lineIndent, indent);
    }
  });

  return lines.map(line => line.substr(indent)).join('\n').trim();
}
