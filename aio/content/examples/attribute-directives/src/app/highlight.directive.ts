/* tslint:disable:member-ordering */
// #docregion imports, 
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
// #enddocregion imports

@Directive({
  selector: '[myHighlight]'
})
export class HighlightDirective {

  constructor(private el: ElementRef) { }

  // #docregion defaultColor
  @Input() defaultColor: string;
  // #enddocregion defaultColor

  // #docregion color
  @Input('myHighlight') highlightColor: string;
  // #enddocregion color

  // #docregion mouse-enter
  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor || this.defaultColor || 'red');
  }
  // #enddocregion mouse-enter

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(null);
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
