// #docplaster
// #docregion imports
import {Directive, ElementRef, HostListener, inject} from '@angular/core';
// #enddocregion imports
// #docregion

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  private el = inject(ElementRef);

  // #docregion mouse-methods
  @HostListener('mouseenter') onMouseEnter() {
    this.highlight('yellow');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
  // #enddocregion mouse-methods
}
// #enddocregion
