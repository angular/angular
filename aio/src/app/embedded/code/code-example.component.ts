/* tslint:disable component-selector */
import { Component, ElementRef, AfterViewInit } from '@angular/core';

/**
 * An embeddable code block that displays nicely formatted code.
 * Example usage:
 *
 * ```
 * <code-example language="ts" linenums="2">
 * // a code block
 * console.log('do stuff');
 * </code-example>
 * ```
 */
@Component({
  selector: 'code-example',
  template: `
    <aio-code [language]="language" [linenums]="linenums" [code]="code"></aio-code>
  `
})
export class CodeExampleComponent implements AfterViewInit {

  language: string;
  linenums: number|boolean;
  code: string;

  constructor(private elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;
    this.language = element.getAttribute('language');
    const linenums = element.getAttribute('linenums');
    this.linenums = linenums === 'true' ? true :
                    (linenums === 'false' || !linenums) ? false :
                    parseInt(this.elementRef.nativeElement.getAttribute('linenums'), 10);
  }

  ngAfterViewInit() {
    // The `codeExampleContent` property is set by the DocViewer when it builds this component.
    // It is the original innerHTML of the host element.
    this.code = this.elementRef.nativeElement.codeExampleContent;
    console.log(this.code);
  }
}
