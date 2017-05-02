import { Component, ElementRef, ViewChild, OnChanges, OnDestroy, Input } from '@angular/core';
import { Logger } from 'app/shared/logger.service';
import { PrettyPrinter } from './pretty-printer.service';
import { CopierService } from 'app/shared/copier.service';
import { MdSnackBar } from '@angular/material';

const originalLabel = 'Copy Code';
const copiedLabel = 'Copied!';
const defaultLineNumsCount = 10; // by default, show linenums over this number

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
 *   [code]="variableContainingCode"
 *   [language]="ts"
 *   [linenums]="true"
 *   [path]="ts-to-js/ts/src/app/app.module.ts"
 *   [region]="ng2import">
 * </aio-code>
 * ```
 */
@Component({
  selector: 'aio-code',
  template: `
    <pre class="prettyprint lang-{{language}}">
      <button *ngIf="!hideCopy" class="material-icons copy-button" (click)="doCopy()">content_copy</button>
      <code class="animated fadeIn" #codeContainer></code>
    </pre>
    `
})
export class CodeComponent implements OnChanges {

  /**
   * The code to be formatted, this should already be HTML encoded
   */
  @Input()
  code: string;

  /**
   * The language of the code to render
   * (could be javascript, dart, typescript, etc)
   */
  @Input()
  language: string;

  /**
   * Whether to display line numbers:
   *  - false: don't display
   *  - true: do display
   *  - number: do display but start at the given number
   */
  @Input()
  linenums: boolean | number | string;

  /**
   * path to the source of the code being displayed
   */
  @Input()
  path: string;

  /**
   * region of the source of the code being displayed
   */
  @Input()
  region: string;

  /**
   * set to true if the copy button is not to be shown
   */
  @Input()
  hideCopy: boolean;

  /**
   * The element in the template that will display the formatted code
   */
  @ViewChild('codeContainer') codeContainer: ElementRef;

  constructor(
    private snackbar: MdSnackBar,
    private pretty: PrettyPrinter,
    private copier: CopierService,
    private logger: Logger) {}

  ngOnChanges() {
    this.code = this.code && leftAlign(this.code);

    if (!this.code) {
      const src = this.path ? this.path + (this.region ? '#' + this.region : '') : '';
      const srcMsg = src ? ` for<br>${src}` : '.';
      this.setCodeHtml(`<p class="code-missing">The code sample is missing${srcMsg}</p>`);
      return;
    }

    const linenums = this.getLinenums();

    this.setCodeHtml(this.code); // start with unformatted code
    this.pretty.formatCode(this.code, this.language, linenums).subscribe(
      formattedCode => this.setCodeHtml(formattedCode),
      err => { /* ignore failure to format */ }
    );
  }

  private setCodeHtml(formattedCode: string) {
    // **Security:** `codeExampleContent` is provided by docs authors and as such its considered to
    // be safe for innerHTML purposes.
    this.codeContainer.nativeElement.innerHTML = formattedCode;
  }

  doCopy() {
    // We take the innerText because we don't want it to be HTML encoded
    const code = this.codeContainer.nativeElement.innerText;
    if (this.copier.copyText(code)) {
      this.logger.log('Copied code to clipboard:', code);
      // success snackbar alert
      this.snackbar.open('Code Copied', '', {
        duration: 800,
      });
    } else {
      this.logger.error('ERROR copying code to clipboard:', code);
      // failure snackbar alert
      this.snackbar.open('Copy failed. Please try again!', '', {
        duration: 800,
      });
    }
  }

  getLinenums() {
    const linenums =
      typeof this.linenums === 'boolean' ? this.linenums :
      this.linenums === 'true' ? true :
      this.linenums === 'false' ? false :
      typeof this.linenums === 'string' ? parseInt(this.linenums, 10) :
      this.linenums;

    // if no linenums, enable line numbers if more than one line
    return linenums == null || linenums === NaN ?
      (this.code.match(/\n/g) || []).length > defaultLineNumsCount : linenums;
  }
}

function leftAlign(text) {
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
