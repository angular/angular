// #docregion, imports
import {Directive, ElementRef, HostListener, inject, input} from '@angular/core';
// #enddocregion imports

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  private el = inject(ElementRef);

  // #docregion input
  appHighlight = input('');
  // #enddocregion input

  // #docregion mouse-enter
  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appHighlight() || 'red');
  }
  // #enddocregion mouse-enter

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
