/* eslint-disable @angular-eslint/directive-selector */
// #docregion
import {Directive, ElementRef, inject, input, OnChanges} from '@angular/core';

@Directive({selector: '[highlight]'})
/**
 * Set backgroundColor for the attached element to highlight color
 * and set the element's customProperty to true
 */
export class HighlightDirective implements OnChanges {
  defaultColor = 'rgb(211, 211, 211)'; // lightgray

  bgColor = input('', {alias: 'highlight'});

  private el = inject(ElementRef);

  constructor() {
    this.el.nativeElement.style.customProperty = true;
  }

  ngOnChanges() {
    this.el.nativeElement.style.backgroundColor = this.bgColor || this.defaultColor;
  }
}
