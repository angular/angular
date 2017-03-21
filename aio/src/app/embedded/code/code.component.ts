import { Component, ElementRef, ViewChild, OnChanges, OnDestroy, Input } from '@angular/core';
import { Logger } from 'app/shared/logger.service';
import { PrettyPrinter } from './pretty-printer.service';
import { CopierService } from 'app/shared/copier.service';

const originalLabel = 'Copy Code';
const copiedLabel = 'Copied!';

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
 *   <aio-code [language]="ts" [linenums]="true" [code]="variableContainingCode"></aio-code>
 * ```
 *
 */
@Component({
  selector: 'aio-code',
  template: `
    <button #copyButton (click)="doCopy()">{{ buttonLabel }}</button>
    <pre class="{{classes}}">
      <code class="{{animatedClasses}}" #codeContainer></code>
    </pre>
    `
})
export class CodeComponent implements OnChanges {

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
  linenums: boolean|number = false;

  /**
   * The code to be formatted, this should already be HTML encoded
   */
  @Input()
  code: string;

  /**
   * The label to show on the copy button
   */
  buttonLabel = originalLabel;

  /**
   * The element in the template that will display the formatted code
   */
  @ViewChild('codeContainer') codeContainer: ElementRef;

  constructor(private pretty: PrettyPrinter, private copier: CopierService, private logger: Logger) {}

  ngOnChanges() {
    // Right now, the prettyPrint library is loaded synchronously at application start up.
    // It is a very small file so there is probably little benefit in lazy loading it
    const formattedCode = this.pretty.formatCode(this.code, this.language, this.linenums);
    console.log(this.code, this.language, this.linenums, formattedCode);

    // **Security:** `codeExampleContent` is provided by docs authors and as such its considered to
    // be safe for innerHTML purposes.
    this.codeContainer.nativeElement.innerHTML = formattedCode;
  }

  doCopy() {
    // We take the innerText because we don't want it to be HTML encoded
    const code = this.codeContainer.nativeElement.innerText;
    if (this.copier.copyText(code)) {
      this.logger.log('Copied code to clipboard:', code);
      // change the button label (for one second)
      this.buttonLabel = copiedLabel;
      setTimeout(() => this.buttonLabel = originalLabel, 1000);
    } else {
      this.logger.error('ERROR copying code to clipboard:', code);
    }
  }
}
