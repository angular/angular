/* tslint:disable:member-ordering */
// #docregion, imports
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
// #enddocregion imports

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {

  constructor(private el: ElementRef) { }

  // #docregion input
  @Input() appHighlight = '';
  // #enddocregion input

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appHighlight || 'red');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
