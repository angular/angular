/* tslint:disable:no-unused-variable member-ordering */
// #docplaster
// #docregion
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[myHighlight]'
})
export class HighlightDirective {
  // #docregion ctor
  constructor(private el: ElementRef) { }
  // #enddocregion ctor

  // #docregion mouse-methods, host
  @HostListener('mouseenter') onMouseEnter() {
    // #enddocregion host
    this.highlight('yellow');
    // #docregion host
  }

  @HostListener('mouseleave') onMouseLeave() {
    // #enddocregion host
    this.highlight(null);
    // #docregion host
  }
  // #enddocregion host

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
  // #enddocregion mouse-methods, 

  // #docregion color
  @Input() highlightColor: string;
  // #enddocregion color

  // #docregion color-2
  @Input() myHighlight: string;
  // #enddocregion color-2
}

