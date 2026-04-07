// #docplaster
// #docregion imports
import {Directive, ElementRef, inject} from '@angular/core';
// #enddocregion imports
// #docregion

// #docregion decorator
@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
// #enddocregion decorator
export class HighlightDirective {
  private el = inject(ElementRef);

  // #docregion mouse-methods
  onMouseEnter() {
    this.highlight('yellow');
  }

  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
  // #enddocregion mouse-methods
}
// #enddocregion
