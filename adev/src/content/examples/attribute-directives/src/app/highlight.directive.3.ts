// #docregion, imports
import {Directive, ElementRef, inject, input} from '@angular/core';
// #enddocregion imports

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  private el = inject(ElementRef);

  // #docregion input
  appHighlight = input('');
  // #enddocregion input

  // #docregion mouse-enter
  onMouseEnter() {
    this.highlight(this.appHighlight() || 'red');
  }
  // #enddocregion mouse-enter

  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
