// #docregion
import { Directive, ElementRef } from '@angular/core';

// Same directive name and selector as
// HighlightDirective in parent AppRootModule
// It selects for both input boxes and  'highlight' attr
// and it highlights in beige instead of yellow
@Directive({ selector: '[highlight]' })
export class HighlightDirective {
    constructor(el: ElementRef) {
       el.nativeElement.style.backgroundColor = 'beige';
       console.log(`* Hero highlight called for ${el.nativeElement.tagName}`);
    }
}
