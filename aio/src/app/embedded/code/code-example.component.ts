/* tslint:disable component-selector */
import { Component, ElementRef, OnInit } from '@angular/core';

/**
 * An embeddable code block that displays nicely formatted code.
 * Example usage:
 *
 * ```
 * <code-example language="ts" linenums="2" class="special" title="Do Stuff">
 * // a code block
 * console.log('do stuff');
 * </code-example>
 * ```
 */
@Component({
  selector: 'code-example',
  template: `
    <header *ngIf="title">{{title}}</header>
    <aio-code [code]="code" [language]="language" [linenums]="linenums"></aio-code>
  `
})
export class CodeExampleComponent implements OnInit { // implements AfterViewInit {

  code: string;
  language: string;
  linenums: boolean | number;
  title: string;

  constructor(private elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;
    this.language = element.getAttribute('language') || '';
    this.linenums = element.getAttribute('linenums');
    this.title = element.getAttribute('title') || '';
  }

  ngOnInit() {
    // The `codeExampleContent` property is set by the DocViewer when it builds this component.
    // It is the original innerHTML of the host element.
    this.code = this.elementRef.nativeElement.codeExampleContent;
  }
}
