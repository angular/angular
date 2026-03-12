import {Directive, ElementRef, inject, input} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  private el = inject(ElementRef);

  // #docregion defaultColor
  defaultColor = input('');
  // #enddocregion defaultColor

  appHighlight = input('');

  // #docregion mouse-enter
  onMouseEnter() {
    this.highlight(this.appHighlight() || this.defaultColor() || 'red');
  }
  // #enddocregion mouse-enter

  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
