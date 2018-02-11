// Exact copy of contact/highlight.directive except for color and message
import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[highlight], input' })
// Highlight the host element or any InputElement in gray
export class HighlightDirective {
  constructor(el: ElementRef) {
    el.nativeElement.style.backgroundColor = 'lightgray';
    console.log(
      `* Shared highlight called for ${el.nativeElement.tagName}`);
  }
}
