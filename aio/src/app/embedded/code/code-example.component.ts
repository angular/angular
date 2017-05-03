/* tslint:disable component-selector */
import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { getBoolFromAttribute } from 'app/shared/attribute-utils';

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
    <aio-code [ngClass]="classes" [code]="code"
    [language]="language" [linenums]="linenums" [path]="path" [region]="region" [hideCopy]="hideCopy"></aio-code>
  `
})
export class CodeExampleComponent implements OnInit {

  classes: {};
  code: string;
  language: string;
  linenums: boolean | number;
  path: string;
  region: string;
  title: string;
  hideCopy: boolean;

  @HostBinding('class.avoidFile')
  isAvoid = false;

  constructor(private elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;

    this.language = element.getAttribute('language') || '';
    this.linenums = element.getAttribute('linenums');
    this.path = element.getAttribute('path') || '';
    this.region = element.getAttribute('region') || '';
    this.title = element.getAttribute('title') || '';

    this.isAvoid = this.path.indexOf('.avoid.') !== -1;
    this.hideCopy = this.isAvoid || getBoolFromAttribute(element, ['hidecopy', 'hide-copy']);

    this.classes = {
      'headed-code': !!this.title,
      'simple-code': !this.title,
    };
  }

  ngOnInit() {
    // The `codeExampleContent` property is set by the DocViewer when it builds this component.
    // It is the original innerHTML of the host element.
    this.code = this.elementRef.nativeElement.codeExampleContent;
  }
}
