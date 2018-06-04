// #docplaster
// Same directive name and selector as
// HighlightDirective in parent AppModule
// It selects for both input boxes and  'highlight' attr
// and it highlights in blue instead of gold

// #docregion
import { Directive, ElementRef } from '@angular/core';

// Highlight the host element or any InputElement in blue
@Directive({ selector: '[highlight], input' })
export class ContactHighlightDirective {
  constructor(el: ElementRef) {
    el.nativeElement.style.backgroundColor = 'powderblue';
    // #enddocregion
    console.log(`* Contact highlight called for ${el.nativeElement.tagName}`);
    // #docregion
  }
}
// #enddocregion
