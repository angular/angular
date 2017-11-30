/* tslint:disable:no-unused-variable member-ordering */
// #docplaster
// #docregion imports,
import { Directive, ElementRef, HostListener } from '@angular/core';
// #enddocregion imports,
import { Input } from '@angular/core';
// #docregion

@Directive({
  selector: '[appHighlight]'
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
  @Input() appHighlight: string;
  // #enddocregion color-2
}

