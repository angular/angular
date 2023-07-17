// #docplaster
// #docregion imports
import { Directive, ElementRef, HostListener } from '@angular/core';
// #enddocregion imports
import { Input } from '@angular/core';
// #docregion

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {

  constructor(private el: ElementRef) { }

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
