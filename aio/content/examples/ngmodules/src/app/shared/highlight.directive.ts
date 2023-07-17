/* eslint-disable @angular-eslint/directive-selector */
// Exact copy of contact/highlight.directive except for color and message
import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[highlight], input' })
/** Highlight the attached element or an InputElement in gray */
export class HighlightDirective {
  constructor(el: ElementRef) {
    el.nativeElement.style.backgroundColor = '#efeeed';
    console.log(
      `* Shared highlight called for ${el.nativeElement.tagName}`);
  }
}
